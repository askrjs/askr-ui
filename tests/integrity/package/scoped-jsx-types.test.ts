import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

function readDeclarationFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return readDeclarationFiles(path);
    return entry.isFile() && /\.d\.(?:ts|cts)$/.test(entry.name) ? [path] : [];
  });
}

describe('Packed JSX declarations', () => {
  it('should scope every JSX type reference to the Askr JSX runtime', () => {
    const declarationFiles = readDeclarationFiles(join(process.cwd(), 'dist'));
    const unscopedReferences: string[] = [];
    const globalNamespaces: string[] = [];

    for (const path of declarationFiles) {
      const declaration = readFileSync(path, 'utf8');
      if (/\bJSX\./.test(declaration)) {
        const scopedImport =
          /import\s*\{[^}]*\bJSX\b[^}]*\}\s*from\s*["']@askrjs\/askr\/jsx-runtime["']/.test(
            declaration
          ) ||
          /import\(["']@askrjs\/askr\/jsx-runtime["']\)\.JSX\./.test(
            declaration
          );
        if (!scopedImport) unscopedReferences.push(path);
      }

      if (/declare\s+global\s*\{\s*namespace\s+JSX\b/.test(declaration)) {
        globalNamespaces.push(path);
      }
    }

    expect(declarationFiles.length).toBeGreaterThan(0);
    expect(unscopedReferences).toEqual([]);
    expect(globalNamespaces).toEqual([]);
  });
});
