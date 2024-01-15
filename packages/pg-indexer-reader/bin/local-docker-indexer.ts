#!/usr/bin/env node
import { execSync } from "child_process";

try {
  execSync("pnpm run start:local", { stdio: "inherit" });
} catch (error) {
  console.error("Failed to start local docker indexer:", error);
  process.exit(1);
}
