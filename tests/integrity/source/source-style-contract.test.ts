import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(candidate);
    return entry.isFile() && /\.(ts|tsx)$/.test(entry.name) ? [candidate] : [];
  });
}

describe('Component style contract', () => {
  it('should not emit or mutate inline styles', () => {
    const components = path.resolve(__dirname, '../../../src/components');
    const violations = sourceFiles(components).flatMap((file) => {
      const relative = path.relative(components, file);
      return fs
        .readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .flatMap((line, index) =>
          /\bstyle\s*=\s*(?:\{|['"])|\.style\.[A-Za-z_$][\w$]*\s*=|\.style\.setProperty\s*\(|setAttribute\(\s*['"]style['"]/.test(
            line
          )
            ? [`${relative}:${index + 1}: ${line.trim()}`]
            : []
        );
    });

    expect(violations).toEqual([]);
  });
});
