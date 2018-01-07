# Nano Sync

Continuous filter updates delivery

A (prototype) file based differential update engine for filter lists. 

## Usage

Install
```Bash
npm install -g nano-sync
```

Command Line
```Bash
nano-sync /path/to/filter.txt [-o /path/to/output/directory/] [-c /path/to/config/directory/]
```

Integration
```JavaScript
"use strict";

const nsync = require("nano-sync");
nsync.ezPatch("filter.txt");
```

You need to commit `./nano-sync-data/config.json`, although not other cache files in that directory, 
you should add the following line to `.gitignore` file: 
```
nano-sync-data/*.txt
```

## Technical

Nano Sync will, by default, generate the following output structure: 
```
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
  checkpoint: 35,
  latest: 37
}
```

`checkpoint` denotes the version of the checkpoint, `latest` denotes the latest version. 

In the above example, `1.patch` then `2.patch` need to be applied to `checkpoint.txt` to get the latest filter. 
`3.patch` and `4.patch` are leftover patch file from last round, they are not deleted to not generate more git history than required. 
