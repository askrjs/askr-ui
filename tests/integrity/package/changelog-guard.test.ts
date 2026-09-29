import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vite-plus/test';

const ROOT_DIR = process.cwd();
const PACKAGE_JSON = join(ROOT_DIR, 'package.json');

const GUARD = join(ROOT_DIR, 'scripts', 'check-changelog.mjs');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const fixtures: string[] = [];

type PackRecord = { files: Array<{ path: string }> };

function runGuard(version: string, changelog: string) {
  const dir = mkdtempSync(join(tmpdir(), 'askr-changelog-guard-'));
  fixtures.push(dir);
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({ name: 'fixture', version })
  );
  writeFileSync(join(dir, 'CHANGELOG.md'), changelog);
  return spawnSync(process.execPath, [GUARD], { cwd: dir, encoding: 'utf8' });
}

function expectRejected(version: string, changelog: string) {
  const result = runGuard(version, changelog);
  expect(result.status, result.stdout + result.stderr).toBe(1);
  expect(result.stderr).toContain(version);
}

function expectAccepted(version: string, changelog: string) {
  const result = runGuard(version, changelog);
  expect(result.status, result.stdout + result.stderr).toBe(0);
}

afterEach(() => {
  for (const dir of fixtures.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

describe('changelog release guard', () => {
  it('should reject a version whose changelog has no section', () => {
    expectRejected(
      '0.4.0',
      '# Changelog\n\n## Unreleased\n\n## 0.3.0 - 2026-09-11\n\n- Fixed a thing.\n'
    );
  });

  it("should not count Unreleased entries as the version's section", () => {
    expectRejected(
      '0.4.0',
      '# Changelog\n\n## Unreleased\n\n- Shipped in 0.4.0.\n'
    );
    expectRejected(
      '0.4.0',
      '# Changelog\n\n## Unreleased (0.4.0)\n\n- Shipped.\n'
    );
  });

  it('should require an exact version match', () => {
    const base = '# Changelog\n\n## Unreleased\n\n';
    expectRejected('0.4.0', `${base}## 10.4.0 - 2026-09-28\n\n- Fixed.\n`);
    expectRejected('0.4.0', `${base}## 0.4.01 - 2026-09-28\n\n- Fixed.\n`);
    expectRejected(
      '0.4.0',
      `${base}## 0.4.0-beta.1 - 2026-09-28\n\n- Fixed.\n`
    );
    expectRejected('0.4.0', `${base}## 0x4x0 - 2026-09-28\n\n- Fixed.\n`);
  });

  it('should require prerelease versions to have their own section', () => {
    const stable =
      '# Changelog\n\n## Unreleased\n\n## 0.5.0 - 2026-10-01\n\n- Fixed.\n';
    expectRejected('0.5.0-beta.1', stable);
    expectAccepted(
      '0.5.0-beta.1',
      '# Changelog\n\n## Unreleased\n\n## 0.5.0-beta.1 - 2026-10-01\n\n- Fixed.\n'
    );
  });

  it('should require a dated second-level release heading', () => {
    const base = '# Changelog\n\n## Unreleased\n\n';
    expectRejected('0.4.0', `${base}### 0.4.0 - 2026-09-28\n\n- Fixed.\n`);
    expectRejected('0.4.0', `${base}## 0.4.0\n\n- Fixed.\n`);
    expectRejected('0.4.0', `${base}## 0.4.0 - soon\n\n- Fixed.\n`);
  });

  it('should reject an empty section', () => {
    expectRejected(
      '0.4.0',
      '# Changelog\n\n## Unreleased\n\n## 0.4.0 - 2026-09-28\n\n### Breaking\n\n## 0.3.0 - 2026-09-11\n\n- Fixed.\n'
    );
  });

  it('should not count markup, link definitions, or placeholders as entries', () => {
    const heading = '# Changelog\n\n## Unreleased\n\n## 0.4.0 - 2026-09-28\n\n';
    for (const body of [
      '-\n',
      '---\n',
      '<br>\n',
      '<details></details>\n',
      '​\n',
      'TBD\n',
      '- TODO\n',
      '<!-- fill in -->\n',
      '```\nnotes\n```\n',
      '[0.4.0]: https://github.com/askrjs/example/compare/v0.3.0...v0.4.0\n',
    ]) {
      expectRejected('0.4.0', `${heading}${body}`);
    }
  });

  it('should count entries that use angle brackets as text', () => {
    const heading = '# Changelog\n\n## 0.4.0 - 2026-09-28\n\n';
    expectAccepted('0.4.0', `${heading}- <3 faster\n`);
    expectAccepted('0.4.0', `${heading}- Fixed <kbd>Tab</kbd> focus.\n`);
    expectAccepted('0.4.0', `${heading}Intro <!-- note --> text.\n`);
  });

  it('should reject an impossible release date', () => {
    expectRejected(
      '0.4.0',
      '# Changelog\n\n## 0.4.0 - 2026-99-99\n\n- Fixed.\n'
    );
    expectRejected(
      '0.4.0',
      '# Changelog\n\n## 0.4.0 - 2026-02-30\n\n- Fixed.\n'
    );
  });

  it('should count an undated heading as a duplicate section', () => {
    expectRejected(
      '0.4.0',
      '# Changelog\n\n## 0.4.0 - 2026-09-28\n\n- Fixed.\n\n## [0.4.0]\n\n- Also fixed.\n'
    );
  });

  it('should not let a stray comment opener in code hide the section', () => {
    const section = '## 0.4.0 - 2026-09-28\n\n- Fixed.\n';
    expectAccepted(
      '0.4.0',
      `# Changelog\n\nUse \`<!--\` sparingly.\n\n${section}`
    );
    expectAccepted(
      '0.4.0',
      `# Changelog\n\n\`\`\`html\n<!-- example\n\`\`\`\n\n${section}`
    );
  });

  it('should ignore headings inside code fences and HTML comments', () => {
    const base = '# Changelog\n\n## Unreleased\n\n';
    expectRejected(
      '0.4.0',
      `${base}\`\`\`md\n## 0.4.0 - 2026-09-28\n\n- Fixed.\n\`\`\`\n`
    );
    expectRejected(
      '0.4.0',
      `${base}~~~\n## 0.4.0 - 2026-09-28\n\n- Fixed.\n~~~\n`
    );
    expectRejected(
      '0.4.0',
      `${base}<!--\n## 0.4.0 - 2026-09-28\n\n- Fixed.\n-->\n`
    );
  });

  it('should reject a duplicated section', () => {
    const section = '## 0.4.0 - 2026-09-28\n\n- Fixed.\n\n';
    expectRejected(
      '0.4.0',
      `# Changelog\n\n## Unreleased\n\n${section}${section}`
    );
  });

  it('should reject a version that is not valid semver', () => {
    expectRejected('0.4', '# Changelog\n\n## 0.4 - 2026-09-28\n\n- Fixed.\n');
  });

  it('should accept the supported heading styles', () => {
    const body = '\n\n- Fixed.\n';
    expectAccepted(
      '0.4.0',
      `# Changelog\n\n## Unreleased\n\n## 0.4.0 - 2026-09-28${body}`
    );
    expectAccepted('0.4.0', `# Changelog\n\n## 0.4.0 — 2026-09-28${body}`);
    expectAccepted('0.4.0', `# Changelog\n\n## [0.4.0] - 2026-09-28${body}`);
    expectAccepted(
      '0.4.0',
      `# Changelog\r\n\r\n## 0.4.0 - 2026-09-28\r\n\r\n- Fixed.\r\n`
    );
    expectAccepted('0.4.0', `﻿## 0.4.0 - 2026-09-28${body}`);
    expectAccepted('0.4.0', `# Changelog\n\n## 0.4.0 – 2026-09-28${body}`);
    expectAccepted(
      '0.4.0',
      `# Changelog\n\n  ##  0.4.0  -  2026-09-28 ##${body}`
    );
    expectAccepted(
      '0.4.0',
      `# Changelog\n\n## [0.4.0](https://example.test/compare/v0.3.0...v0.4.0) (2026-09-28)${body}`
    );
  });

  it('should match build-metadata versions with or without the metadata', () => {
    expectAccepted(
      '0.4.0+build.5',
      '# Changelog\n\n## 0.4.0 - 2026-09-28\n\n- Fixed.\n'
    );
    expectAccepted(
      '0.4.0+build.5',
      '# Changelog\n\n## 0.4.0+build.5 - 2026-09-28\n\n- Fixed.\n'
    );
  });

  it("should pass for this package's current version", () => {
    const result = spawnSync(process.execPath, [GUARD], {
      cwd: ROOT_DIR,
      encoding: 'utf8',
    });
    expect(result.status, result.stdout + result.stderr).toBe(0);
  });

  it('should run before publishing and in the release gate', () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf-8')) as {
      scripts: Record<string, string>;
    };

    expect(pkg.scripts['changelog:check']).toBe(
      'node scripts/check-changelog.mjs'
    );
    expect(pkg.scripts.check).toMatch(/^npm run changelog:check && /);
    expect(pkg.scripts.prepublishOnly).toBe('npm run check');
  });

  it('should ship CHANGELOG.md in the npm package', () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf-8')) as {
      files: string[];
    };
    expect(pkg.files).toContain('CHANGELOG.md');

    const output = spawnSync(
      npm,
      ['pack', '--dry-run', '--json', '--ignore-scripts'],
      {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        shell: process.platform === 'win32',
      }
    ).stdout;
    // npm 11 prints an array of pack records; npm 12 keys them by package name.
    const parsed = JSON.parse(output) as
      | PackRecord[]
      | Record<string, PackRecord>;
    const records = Array.isArray(parsed) ? parsed : Object.values(parsed);
    expect(records).toHaveLength(1);
    expect(records[0].files.map(({ path }) => path)).toContain('CHANGELOG.md');
  }, 60_000);
});
