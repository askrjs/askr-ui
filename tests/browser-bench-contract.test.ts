import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

describe('Browser bench contract', () => {
  it('keeps the tier3 browser benchmark files aligned with the browser bench contract', () => {
    const benchFiles = readdirSync(join(process.cwd(), 'benches', 'tier3'), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.bench.tsx'))
      .map((entry) => ({
        name: entry.name,
        contents: readFileSync(
          join(process.cwd(), 'benches', 'tier3', entry.name),
          'utf8'
        ),
      }))
      .sort((left, right) => left.name.localeCompare(right.name));

    expect(benchFiles.map((entry) => entry.name)).toEqual(
      expect.arrayContaining([
        'controls.browser.bench.tsx',
        'overlays.browser.bench.tsx',
      ])
    );

    const contents = benchFiles.map(({ contents }) => contents).join('\n');

    expect(contents).toContain('mount 1k native buttons');
    expect(contents).toContain('open and close dialog');
    expect(contents).toContain('open and close popover');
    expect(contents).toContain('open and close dropdown');
  });
});
