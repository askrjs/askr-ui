import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

describe('Browser bench contract', () => {
  it('keeps the tier4 browser benchmark files aligned with the browser bench contract', () => {
    const tier3BrowserBenchFiles = readdirSync(
      join(process.cwd(), 'benches', 'tier3'),
      {
        withFileTypes: true,
      }
    ).filter((entry) => entry.isFile() && entry.name.endsWith('.browser.bench.tsx'));

    expect(tier3BrowserBenchFiles).toEqual([]);

    const benchFiles = readdirSync(join(process.cwd(), 'benches', 'tier4'), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.bench.tsx'))
      .map((entry) => ({
        name: entry.name,
        contents: readFileSync(
          join(process.cwd(), 'benches', 'tier4', entry.name),
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
    expect(contents).toContain(
      'cycle 100 dialog open/close with listener cleanup'
    );
    expect(contents).toContain(
      'cycle 100 popover open/close with listener cleanup'
    );
    expect(contents).toContain(
      'cycle 100 dropdown open/close with listener cleanup'
    );
    expect(contents).toContain(
      'cycle 100 select open/close with listener cleanup'
    );
    expect(contents).toContain(
      'cycle 100 tooltip open/close with listener cleanup'
    );
    expect(contents).toContain(
      'cycle 100 toast open/close with listener cleanup'
    );
  });
});
