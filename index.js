/**
 * A toolkit for creating differential update files for
 * adblockers, with some extra features designed for
 * Nano Adblocker.
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const assert = require("assert");
const diff = require("diff");
const fs = (() => {
    const ofs = require("fs");
    const mkdirp = require("mkdirp");
    const util = require("util");

    return {
        copyFile: util.promisify(ofs.copyFile),
        mkdirp: util.promisify(mkdirp),
        readFile: util.promisify(ofs.readFile),
        writeFile: util.promisify(ofs.writeFile),
    };
})();
const path = require("path");

/**
 * Create or update a differential update database with one call.
 * @async @function
 * @param {string} filter - The path to the filter file.
 * @param {string} [output=autodetect] - The path to the output folder,
 ** defaults to filter file name without extension plus "-diff".
 ** For example, "filter.txt" will become "filter-diff".
 * @param {string} [config="nano-sync-config"] - The path to the config
 ** and cache folder. You should commit only "config.json" in that folder.
 ** Hint: Add "nano-sync-config/*.txt" to ".gitignore".
 */
exports.ezPatch = async (filter, output, config = "nano-sync-config") => {
    // Process arguments
    assert(filter && typeof filter === "string");
    if (typeof output === "undefined") {
        const ext = path.extname(filter);
        output = path.resolve(
            path.dirname(filter),
            path.basename(filter, ext) + "-diff"
        );
    }
    assert(output && typeof output === "string");

    // Make sure directories exist
    await Promise.all([
        fs.mkdirp(output),
        fs.mkdirp(config),
    ]);

    // Read main configuration data
    let mainConfig = {};
    try {
        const data = await fs.readFile(path.resolve(config, "config.json"), "utf8");
        mainConfig = JSON.parse(data);
    } catch (err) { }

    // Read configuration data for this filter
    let filterConfig = {
        lastFile: null,
        lastVersion: -1,
    };
    if (mainConfig.hasOwnProperty(filter)) {
        filterConfig = mainConfig[filter];
    } else {
        mainConfig[filter] = filterConfig;
    }
    assert(filterConfig.lastFile === null || typeof filterConfig.lastFile === "string");
    assert(typeof filterConfig.lastVersion === "number");

    // Create checkpoint
    const createCheckpoint = async () => {
        filterConfig.lastVersion++;

        await fs.copyFile(filter, path.resolve(output, "checkpoint.txt"));
        const meta = {
            checkpoint: filterConfig.lastVersion,
            latest: filterConfig.lastVersion,
        };
        await fs.writeFile(path.resolve(output, "meta.json"), JSON.stringify(meta), "utf8");

        await fs.copyFile(filter, path.resolve(config, filterConfig.lastFile));
    };

    // Process filter
    if (filterConfig.lastFile === null) {
        // First build
        filterConfig.lastFile =
            Math.random().toString(32).substring(2) +
            Math.random().toString(32).substring(2) +
            ".txt";
        await createCheckpoint();
    } else {
        // Gather necessary data
        let meta, oldf;
        try {
            const data = await fs.readFile(path.resolve(output, "meta.json"), "utf8");
            meta = JSON.parse(data);
            assert(typeof meta.checkpoint === "number" && typeof meta.latest === "number");

            oldf = await fs.readFile(path.resolve(config, filterConfig.lastFile), "utf8");
        } catch (err) {
            // Bail out and create new checkpoint
            meta = oldf = null;
            await createCheckpoint();
        }

        // Create patch
        if (meta && oldf) {
            // Check if there are already too many patches
            if (meta.latest > meta.checkpoint + 10) {
                // I arbitrarily chose 10, which should be around 1 week if there are
                // 1 to 2 build per day
                await createCheckpoint();
            } else {
                const newf = await fs.readFile(filter, "utf8");
                const patch = diff.createPatch("nano-sync-patch", oldf, newf, "unknown-date", "unknown-date");

                // TODO: What if no change? What if change too large?

                meta.latest++;
                filterConfig.lastVersion = meta.latest;

                await fs.writeFile(
                    path.resolve(output, (meta.latest - meta.checkpoint).toString() + ".patch"),
                    patch, "utf8"
                );
                await fs.writeFile(path.resolve(output, "meta.json"), JSON.stringify(meta), "utf8");

                await fs.writeFile(path.resolve(config, filterConfig.lastFile), newf, "utf8");
            }
        }
    }

    // Store main configuration data
    await fs.writeFile(path.resolve(config, "config.json"), JSON.stringify(mainConfig), "utf8");
};
