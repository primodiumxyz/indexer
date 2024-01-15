#!/usr/bin/env node
import { execSync } from "child_process";

try {
  execSync("pnpm run clean:local", { stdio: "inherit" });
} catch (error) {
  console.error("Failed to start local docker indexer:", error);
  process.exit(1);
}
