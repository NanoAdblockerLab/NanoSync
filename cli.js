#!/usr/bin/env node

/**
 * Command line handler.
 * nsync filter.txt [-o output] [-c config]
 */
"use strict";

/**
 * Load modules.
 * @const {Module}
 */
const nsync = require("./index.js");

(async () => {
    let filter, output, config;

    let lastFlag;
    for (let arg of process.argv) {
        if (!filter) {
            filter = arg;
            continue;
        }

        if (arg.startsWith("-")) {
            if (lastFlag !== undefined) {
                console.error("Missing argument for option", lastFlag);
                process.exit(1);
            }
            lastFlag = arg;
            continue;
        }

        if (lastFlag === undefined) {
            console.error("Missing flag");
            process.exit(1);
        }
        switch (lastFlag) {
            case "-o":
                output = arg;
                break;
            case "-c":
                config = arg;
                break;
            default:
                console.error("Unknown option", lastFlag);
                process.exit(1);
        }
        lastFlag = undefined;
    }

    if (config) {
        await nsync.ezPatch(filter, output, config);
    } else {
        await nsync.ezPatch(filter, output);
    }
})();
