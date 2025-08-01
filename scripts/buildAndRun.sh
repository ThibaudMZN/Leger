#!/usr/bin/bash

npm run build &&
chmod +x dist/cli/index.js &&
./dist/cli/index.js "$1"