#!/usr/bin/env node

import { build } from './build';

const command = process.argv[2];

if (command === 'build') {
    build().then((result) => console.log(`\x1b[32m ✅ ${result.filesCount} '.slim' files compiled \x1b[0m`));
} else {
    console.error(`\x1b[31m ❌ Unknown command: ${command} \x1b[0m`);
    process.exit(1);
}
