#!/bin/bash

deno run --allow-read --allow-write index.js build/newspaper.js
deno run --allow-read --allow-write index.js build/blog.js
deno run --allow-read --allow-write index.js build/docs.js
minirps docs
