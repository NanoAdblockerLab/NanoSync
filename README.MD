# Nano Sync [![Dependencies](https://david-dm.org/NanoAdblocker/NanoSync.svg)](https://david-dm.org/NanoAdblocker/NanoSync)

[![NPM](https://nodei.co/npm/nano-sync.png)](https://nodei.co/npm/nano-sync/)

Continuous filter update delivery

A file based differential update system for filter lists.

**WORK IN PROGRESS - DEVELOPERS ONLY**

## Usage

Install
```Bash
npm install -g nano-sync
```

Command Line
```Bash
nano-sync /path/to/filter.txt
```

Integration
```JavaScript
"use strict";

const nsync = require("nano-sync");
nsync.ezPatch("filter.txt");
```

You need to commit `./nano-sync-data/config.json`, although not other cache
files in that directory, you should add the following line to `.gitignore`
file:
```Text
nano-sync-data/*.txt
```

If you change your filter list very often, it is recommended to create only one
to two patches per day.

## Technical

Nano Sync will, by default, generate the following output structure:
```Text
filter.txt
filter-diff/
    meta.json
    checkpoint.txt
    1.patch
    2.patch
    3.patch
    4.patch
```

The structure of `meta.json`:
```JSON
{
  "checkpoint": 35,
  "latest": 37
}
```

`checkpoint` denotes the version of the checkpoint, `latest` denotes the latest
version.

In the above example, `1.patch` then `2.patch` need to be applied to
`checkpoint.txt` to generate the latest filter.

`3.patch` and `4.patch` are leftover patch files from last round.

This default mode is optimized for Git repository, you will get a spike in
traffic on every checkpoint, but in return, generates the least amount of extra
Git history.
