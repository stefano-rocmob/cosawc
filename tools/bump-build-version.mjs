import fs from "node:fs";
import path from "node:path";

const versionFile = path.join(process.cwd(), "src/version.ts");
const content = fs.readFileSync(versionFile, "utf8");
const match = content.match(/APP_VERSION = "(\d+)\.(\d+)"/);

if (!match) {
  console.error("Could not parse APP_VERSION in src/version.ts");
  process.exit(1);
}

const major = Number(match[1]);
const minor = Number(match[2]) + 1;
const next = `${major}.${minor}`;
const updated = content.replace(
  /APP_VERSION = "[\d.]+"/,
  `APP_VERSION = "${next}"`,
);

fs.writeFileSync(versionFile, updated);
console.log(`App version bumped to ${next}`);
