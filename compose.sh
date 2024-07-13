#!/bin/bash

deno run --allow-read --allow-write --allow-run --allow-env index.js build/$1.js $2
minirps docs
