#!/usr/bin/env node --experimental-specifier-resolution=node

import runUci from "./uci/uci";

console.log("Starting engine...");
await runUci();