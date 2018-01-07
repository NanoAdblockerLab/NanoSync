# Nano Sync

Continuous filter updates delivery

A (prototype) file based differential update engine for filter lists. 

## Install

```Bash
npm install -g nano-sync
```

## Command Line

```Bash
nano-sync /path/to/filter.txt [-o /path/to/output/directory/] [-c /path/to/config/directory/]
```

## Integration

```JavaScript
"use strict";

const nsync = require("nano-sync");
nsync.ezPatch("filter.txt");
```
