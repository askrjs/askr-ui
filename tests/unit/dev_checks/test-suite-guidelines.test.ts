// @vitest-environment node

import { describe, expect, it } from 'vite-plus/test';
import fs from 'node:fs';
import path from 'node:path';

function readAllTestFiles(dir: string): string[] {
  if (dir.includes(path.join('tests', 'unit', 'dev_checks'))) return [];

  const results: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...readAllTestFiles(full));
    } else if (entry.isFile() && /\.test\.(ts|tsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

const rootDir = path.resolve(__dirname, '..', '..', '..');
const testsDir = path.join(rootDir, 'tests');

describe('Test suite guidelines', () => {
  it('should have no forbidden patterns or invalid titles', () => {
    const files = readAllTestFiles(testsDir);
    const failures: Array<{
      file: string;
      line: number;
      snippet: string;
      rule: string;
      message: string;
    }> = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split(/\r?\n/);

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (/\/\/\s*TODO\b/i.test(line)) {
          failures.push({
            file,
            line: index + 1,
            snippet: line.trim(),
            rule: 'TODO comments',
            message:
              'TODO comments should be converted into issues or concrete tests',
          });
        }
        if (/\b(it|test)\.todo\b/.test(line)) {
          failures.push({
            file,
            line: index + 1,
            snippet: line.trim(),
            rule: 'todo tests',
            message: 'Do not leave tests marked as todo',
          });
        }
        if (/\b(describe|it|test)\.skip\b/.test(line)) {
          failures.push({
            file,
            line: index + 1,
            snippet: line.trim(),
            rule: 'skipped tests',
            message: 'Do not skip tests without an associated issue',
          });
        }
        if (/:\s*any\b/.test(line)) {
          failures.push({
            file,
            line: index + 1,
            snippet: line.trim(),
            rule: 'explicit any',
            message: 'Avoid any in tests; prefer specific types or unknown',
          });
        }
        if (/expect\([^]*?\)\.rejects/.test(line) && !/await\s+/.test(line)) {
          failures.push({
            file,
            line: index + 1,
            snippet: line.trim(),
            rule: 'un-awaited rejects',
            message:
              'Use await expect(...).rejects to ensure assertion is awaited',
          });
        }
        if (/expect\(\s*true\s*\)\.toBe\(\s*true\s*\)/.test(line)) {
          failures.push({
            file,
            line: index + 1,
            snippet: line.trim(),
            rule: 'placeholder true assertion',
            message:
              'Replace placeholder assertions with observable behavior checks',
          });
        }
        if (/\bexpect\s*\([^)]*\|\|\s*true\b/.test(line)) {
          failures.push({
            file,
            line: index + 1,
            snippet: line.trim(),
            rule: 'truthy assertion fallback',
            message:
              'Assertions must not use `|| true`; assert the specific behavior instead',
          });
        }
        if (
          /behavior\.test\.(ts|tsx)$/.test(file) &&
          /\b(setTimeout|sleep)\s*\(/.test(line)
        ) {
          const usesFakeTimers =
            /\bvi\.(useFakeTimers|advanceTimers|runAllTimers|runOnlyPendingTimers)/.test(
              content
            );
          if (!usesFakeTimers) {
            failures.push({
              file,
              line: index + 1,
              snippet: line.trim(),
              rule: 'fixed sleeps in behavior tests',
              message:
                'Behavior tests should use deterministic flushing or fake timers instead of fixed sleeps',
            });
          }
        }
      }
    }

    for (const file of files.filter((candidate) =>
      /\.test\.(ts|tsx)$/.test(candidate)
    )) {
      const content = fs.readFileSync(file, 'utf-8');
      const regex = /\b(it|test)\s*\(\s*(['"`])([^'"\n\r]+)\2/gi;
      let match: RegExpExecArray | null;

      while ((match = regex.exec(content)) !== null) {
        const title = match[3];
        if (!/^should\b/i.test(title)) {
          const line = content.slice(0, match.index).split(/\r?\n/).length;
          failures.push({
            file,
            line,
            snippet: title,
            rule: 'test title convention',
            message: 'Test titles must start with "should" (lowercase)',
          });
        }
      }
    }

    for (const file of files.filter((candidate) =>
      /\.test\.(ts|tsx)$/.test(candidate)
    )) {
      const base = path.basename(file);
      if (!/^[a-z0-9_-]+\.test\.(ts|tsx)$/.test(base)) {
        failures.push({
          file,
          line: 1,
          snippet: path.relative(process.cwd(), file),
          rule: 'test filename convention',
          message:
            'Test filenames must be lowercase and end with .test.ts or .test.tsx',
        });
      }
    }

    if (failures.length > 0) {
      const summary = failures
        .map(
          (failure) =>
            `${path.relative(process.cwd(), failure.file)}:${failure.line} [${failure.rule}] ${failure.snippet}  -- ${failure.message}`
        )
        .join('\n');
      throw new Error('Test suite guideline violations found:\n' + summary);
    }

    expect(failures.length).toBe(0);
  });

  it('should keep browser tests on public component behavior', () => {
    const browserDir = path.join(testsDir, 'browser');
    const files = readAllTestFiles(browserDir).filter((file) =>
      /\.test\.(ts|tsx)$/.test(file)
    );
    const failures: string[] = [];
    const privateImportPattern =
      /from\s+['"][^'"]*\/src\/components\/(?:_internal|[^'"]+\.(?:shared|types))['"]/;

    for (const file of files) {
      const relative = path.relative(rootDir, file).replace(/\\/g, '/');
      const content = fs.readFileSync(file, 'utf-8');

      if (privateImportPattern.test(content)) {
        failures.push(
          `${relative}: browser tests should exercise public component behavior, not private internals`
        );
      }
    }

    expect(failures).toEqual([]);
  });
});
