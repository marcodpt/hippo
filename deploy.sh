#!/bin/bash

deno run --allow-read --allow-write --allow-run --allow-env index.js build/newspaper.js
deno run --allow-read --allow-write --allow-run --allow-env index.js build/blog.js
deno run --allow-read --allow-write --allow-run --allow-env index.js build/docs.js
