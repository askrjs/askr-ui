import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

type PackageExports = Record<string, unknown>;

function exportSupportsPath(exportKey: string, concretePath: string) {
  if (!exportKey.includes('*')) {
    return exportKey === concretePath;
  }

  const [prefix, suffix] = exportKey.split('*');
  return (
    concretePath.startsWith(prefix) &&
    concretePath.endsWith(suffix) &&
    concretePath.length > prefix.length + suffix.length
  );
}

describe('Docs contract', () => {
  it('only references import paths that are published by package exports', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    ) as { exports: PackageExports };
    const exportKeys = Object.keys(packageJson.exports).filter(
      (key) => key !== './package.json'
    );
    const docs = ['README.md', 'askr-ui.md', 'components.md', 'composition.md']
      .map((filename) =>
        readFileSync(join(process.cwd(), 'docs', filename), 'utf8')
      )
      .join('\n');
    const importPaths = Array.from(
      docs.matchAll(/@askrjs\/askr-ui(?:\/[A-Za-z0-9-/*]+)?/g),
      (match) => match[0]
    );

    expect(importPaths.length).toBeGreaterThan(0);

    for (const importPath of importPaths) {
      const exportKey =
        importPath === '@askrjs/askr-ui'
          ? '.'
          : `.${importPath.replace('@askrjs/askr-ui', '')}`;
      const supported = exportKeys.some((candidate) =>
        exportSupportsPath(candidate, exportKey)
      );

      expect(
        supported,
        `Unsupported documented import path: ${importPath}`
      ).toBe(true);
    }
  });
});
