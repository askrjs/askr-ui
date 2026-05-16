import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { componentSurface } from './fixtures/public-surface';

function toPascalCase(componentName: string): string {
  return componentName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function readBenchFiles() {
  return ['tier1', 'tier2']
    .flatMap((tier) =>
      readdirSync(join(process.cwd(), 'benches', tier), {
        withFileTypes: true,
      })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.bench.tsx'))
        .map((entry) => ({
          name: entry.name,
          contents: readFileSync(
            join(process.cwd(), 'benches', tier, entry.name),
            'utf8'
          ),
        }))
    )
    .sort((left, right) => left.name.localeCompare(right.name));
}

describe('Bench contract', () => {
  it('covers the public component surface with benchmark entries', () => {
    const benchFiles = readBenchFiles();
    const contents = benchFiles.map(({ contents }) => contents).join('\n');
    const componentNames = [
      ...componentSurface.map(({ name }) => toPascalCase(name)),
      'DebouncedInput',
    ];

    for (const componentName of componentNames) {
      expect(
        contents.includes(componentName),
        `Missing benchmark coverage for ${componentName}`
      ).toBe(true);
    }

    for (const legacyFileName of [
      'overlays.bench.tsx',
      'selection.bench.tsx',
      'support.bench.tsx',
      'surface-area.bench.tsx',
    ]) {
      expect(
        benchFiles.some((entry) => entry.name === legacyFileName),
        `Legacy grouped benchmark file still present: ${legacyFileName}`
      ).toBe(false);
    }
  });
});
