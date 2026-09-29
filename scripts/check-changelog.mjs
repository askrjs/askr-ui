#!/usr/bin/env node
// Release guard: fails when CHANGELOG.md has no section for the package.json version.
// Runs first in `npm run check`, which `prepublishOnly` and the publish workflow both run.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Semantic Versioning 2.0.0 (https://semver.org), without a leading "v".
const SEMVER =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const RELEASE_HEADING = /^ {0,3}##[ \t]+(.*?)(?:[ \t]+#+)?[ \t]*$/;
const SECTION_END = /^ {0,3}#{1,2}(?:[ \t]|$)/;
const SUB_HEADING = /^ {0,3}#{3,6}(?:[ \t]|$)/;
const LINK_REFERENCE = /^ {0,3}\[[^\]]+\]:[ \t]*\S/;
const THEMATIC_BREAK = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const PLACEHOLDER = /^(?:tbd|tba|todo|wip|n\/a|placeholder|coming soon)\.?$/i;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns the changelog's lines with fenced code blocks, inline code spans, and HTML comments
 * blanked, so headings or entries inside them never count. Fences are found first, so a `<!--`
 * inside code cannot hide the rest of the file.
 */
function visibleLines(changelog) {
  let fence = null;
  let inComment = false;
  return changelog
    .replace(/^﻿/, '')
    .split(/\r\n|\r|\n/)
    .map((line) => {
      if (fence) {
        const close = FENCE.exec(line);
        if (
          close &&
          close[1][0] === fence[0] &&
          close[1].length >= fence.length &&
          close[2].trim() === ''
        ) {
          fence = null;
        }
        return '';
      }
      if (inComment) {
        const end = line.indexOf('-->');
        if (end === -1) return '';
        inComment = false;
        line = line.slice(end + 3);
      } else {
        const open = FENCE.exec(line);
        if (open && !(open[1][0] === '`' && open[2].includes('`'))) {
          fence = open[1];
          return '';
        }
      }
      let visible = line.replace(/(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)/g, ' code ');
      visible = visible.replace(/<!--[\s\S]*?-->/g, '');
      const start = visible.indexOf('<!--');
      if (start !== -1) {
        inComment = true;
        visible = visible.slice(0, start);
      }
      return visible;
    });
}

function isRealDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/** Returns a section line's entry text, or "" for blank space, markup, and link definitions. */
function entryText(line) {
  if (line.trim() === '' || SUB_HEADING.test(line)) return '';
  if (LINK_REFERENCE.test(line) || THEMATIC_BREAK.test(line)) return '';
  const text = line
    .replace(/<[^>]*>/g, '')
    .replace(/^[ \t]*(?:>[ \t]*)*(?:[-*+]|\d+[.)])?[ \t]*/, '')
    .trim();
  return /[\p{L}\p{N}]/u.test(text) ? text : '';
}

/**
 * Returns the problems that should block publishing `version`, or an empty list.
 * A release needs exactly one second-level heading for the version followed by a real calendar
 * date, such as `## 1.2.0 - 2026-09-28`, `## [1.2.0] - 2026-09-28`, `## 1.2.0 — 2026-09-28`, or
 * `## [1.2.0](compare-url) (2026-09-28)`, and at least one entry before the next `#`/`##`
 * heading. "Unreleased" and other versions (including the stable version for a prerelease)
 * never count. Build metadata is optional in the heading, because npm drops it on publish.
 */
function changelogProblems(changelog, version) {
  if (typeof version !== 'string' || !SEMVER.test(version)) {
    return [
      `package.json version ${JSON.stringify(version)} is not a valid semver version.`,
    ];
  }

  const withoutBuild = version.replace(/\+.*$/, '');
  const names = [...new Set([version, withoutBuild])]
    .map(escapeRegExp)
    .join('|');
  const versionHeading = new RegExp(
    `^(?:\\[v?(?:${names})\\](?:\\([^)\\s]*\\))?|v?(?:${names}))(?=[ \\t]|$)(.*)$`
  );
  const datedRest = /^[ \t]+(?:[-–—][ \t]+)?\(?(\d{4}-\d{2}-\d{2})\)?$/;

  const lines = visibleLines(changelog);
  const matches = [];
  for (const [index, line] of lines.entries()) {
    const heading = RELEASE_HEADING.exec(line);
    const match = heading && versionHeading.exec(heading[1]);
    if (!match) continue;
    const date = datedRest.exec(match[1])?.[1];
    matches.push({
      index,
      dated: date !== undefined && isRealDate(date),
      line: line.trim(),
    });
  }

  if (matches.length === 0) {
    return [
      `CHANGELOG.md has no section for ${version}. Add a "## ${withoutBuild} - YYYY-MM-DD" ` +
        `section listing its breaking changes, deprecations, and fixes (entries under ` +
        `"Unreleased" do not count).`,
    ];
  }
  if (matches.length > 1) {
    return [
      `CHANGELOG.md has ${matches.length} sections for ${version}; keep exactly one.`,
    ];
  }

  const [section] = matches;
  if (!section.dated) {
    return [
      `CHANGELOG.md heading "${section.line}" for ${version} needs a real release date, ` +
        `such as "## ${withoutBuild} - YYYY-MM-DD".`,
    ];
  }

  const entries = [];
  for (const line of lines.slice(section.index + 1)) {
    if (SECTION_END.test(line)) break;
    const text = entryText(line);
    if (text) entries.push(text);
  }
  if (entries.length === 0 || PLACEHOLDER.test(entries.join(' '))) {
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
