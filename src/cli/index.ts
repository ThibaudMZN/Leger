#!/usr/bin/env node

import { build } from "./build";
import { dev } from "./dev";
import { pathToFileURL } from "node:url";

export async function runCli(command = process.argv[2]) {
  if (command === "build") {
    const { duration, filesCount } = await build();
    console.log(
      `\x1b[32m✓ ${filesCount} '.leg' files compiled in ${duration.toFixed(1)}ms \x1b[0m`,
    );
  } else if (command === "dev") {
    await dev();
  } else {
    console.error(`\x1b[31m ❌ Unknown command: ${command} \x1b[0m`);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli().then();
}
