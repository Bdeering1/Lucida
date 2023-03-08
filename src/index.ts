#!/usr/bin/env node --experimental-specifier-resolution=node

import runBenchmarks from "./benchmarks/benchmark";
import runUci from "./uci/uci";

console.log("Starting engine...");

if (process.argv.length > 2 && process.argv[2] === "bmk") await runBenchmarks();
else await runUci();