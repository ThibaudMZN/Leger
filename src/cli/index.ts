#!/usr/bin/env node

import { build, dev } from "./build";

const command = process.argv[2];

if (command === "build") {
  build().then((result) =>
    console.log(
      `\x1b[32m ✅ ${result.filesCount} '.slim' files compiled \x1b[0m`,
    ),
  );
} else if (command === "dev") {
  dev().then(() => {});
} else {
  console.error(`\x1b[31m ❌ Unknown command: ${command} \x1b[0m`);
  process.exit(1);
}
