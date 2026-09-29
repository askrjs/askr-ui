#!/usr/bin/env node
// Release guard: fails when CHANGELOG.md has no section for the package.json version.
// Runs from `npm run check`, which `prepublishOnly` and the publish workflow both run.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Semantic Versioning 2.0.0 (https://semver.org), without a leading "v".
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Blanks out fenced code blocks and HTML comments so headings inside them do not count. */
function visibleLines(changelog) {
  const withoutComments = changelog.replace(
    /<!--[\s\S]*?(?:-->|$)/g,
    (comment) => comment.replace(/[^\n]/g, '')
  );
  let fence = null;
  return withoutComments.split(/\r?\n/).map((line) => {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence) {
      if (marker && marker[0] === fence[0] && marker.length >= fence.length)
        fence = null;
      return '';
    }
    if (marker) {
      fence = marker;
      return '';
    }
    return line;
  });
}

/**
 * Returns the problems that should block publishing `version`, or an empty list.
 * A release needs exactly one `## <version> - YYYY-MM-DD` heading (also `## [<version>]`,
 * or an em dash) with at least one entry before the next `## ` heading. "Unreleased" and
 * a different version (including the stable version for a prerelease) never count.
 */
function changelogProblems(changelog, version) {
  if (typeof version !== 'string' || !SEMVER.test(version)) {
    return [
      `package.json version ${JSON.stringify(version)} is not a valid semver version.`,
    ];
  }

  const lines = visibleLines(changelog);
  const escaped = escapeRegExp(version);
  const heading = new RegExp(
    `^## (?:${escaped}|\\[${escaped}\\]) (?:-|—) \\d{4}-\\d{2}-\\d{2}\\s*$`
  );
  const starts = lines.flatMap((line, index) =>
    heading.test(line) ? [index] : []
  );

  if (starts.length === 0) {
    return [
      `CHANGELOG.md has no section for ${version}. Add a "## ${version} - YYYY-MM-DD" section ` +
        `listing its breaking changes, deprecations, and fixes (entries under "Unreleased" do not count).`,
    ];
  }
  if (starts.length > 1) {
    return [
      `CHANGELOG.md has ${starts.length} sections for ${version}; keep exactly one.`,
    ];
  }

  const body = [];
  for (const line of lines.slice(starts[0] + 1)) {
    if (/^#{1,2}(?:\s|$)/.test(line)) break;
    body.push(line);
  }
  const hasEntry = body.some(
    (line) => line.trim() !== '' && !/^#{3,6}(?:\s|$)/.test(line)
  );
  if (!hasEntry) {
    return [`CHANGELOG.md section for ${version} has no entries.`];
  }

  return [];
}

function main() {
  const root = process.cwd();
  let version;
  let changelog;
  try {
    ({ version } = JSON.parse(
      readFileSync(join(root, 'package.json'), 'utf8')
    ));
    changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
  } catch (error) {
    console.error(
      `Changelog check failed for ${version ?? 'this package'}: ${error.message}`
    );
    process.exitCode = 1;
    return;
  }

  const problems = changelogProblems(changelog, version);
  if (problems.length > 0) {
    for (const problem of problems)
      console.error(`Changelog check failed: ${problem}`);
    process.exitCode = 1;
    return;
  }
  console.log(`CHANGELOG.md has a section for ${version}.`);
}

main();
