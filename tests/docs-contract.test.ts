import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import * as askrUi from '../src';
import { publicValueExports } from './fixtures/public-surface';

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

function extractDocumentedImports(docs: string) {
  return Array.from(
    docs.matchAll(
      /import\s*\{([^}]*)\}\s*from\s*['"](@askrjs\/askr-ui(?:\/[A-Za-z0-9-/*]+)?)['"]/g
    ),
    (match) => ({
      symbols: match[1]
        .split(',')
        .map((symbol) => symbol.trim())
        .filter(Boolean)
        .map((symbol) => symbol.replace(/^type\s+/, '').split(/\s+as\s+/)[0])
        .filter(Boolean),
      importPath: match[2],
    })
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
    const documentedImports = extractDocumentedImports(docs);

    expect(documentedImports.length).toBeGreaterThan(0);

    for (const { importPath } of documentedImports) {
      const exportKey =
        importPath === '@askrjs/ui'
          ? '.'
          : `.${importPath.replace('@askrjs/ui', '')}`;
      const supported = exportKeys.some((candidate) =>
        exportSupportsPath(candidate, exportKey)
      );

      expect(
        supported,
        `Unsupported documented import path: ${importPath}`
      ).toBe(true);
    }
  });

  it('keeps the documented component names aligned with the published surface', () => {
    const docs = ['README.md', 'askr-ui.md', 'components.md', 'composition.md']
      .map((filename) =>
        readFileSync(join(process.cwd(), 'docs', filename), 'utf8')
      )
      .join('\n');
    const documentedSymbols = new Set(
      extractDocumentedImports(docs).flatMap(({ symbols }) => symbols)
    );
    const publishedSymbols = publicValueExports.filter(
      (name) => name in askrUi && !name.endsWith('_A11Y_CONTRACT')
    );

    for (const symbol of documentedSymbols) {
      expect(
        symbol in askrUi,
        `Documented symbol is not exported: ${symbol}`
      ).toBe(true);
    }

    for (const symbol of publishedSymbols) {
      expect(
        documentedSymbols.has(symbol),
        `Published export is missing from docs: ${symbol}`
      ).toBe(true);
    }
  });
});
