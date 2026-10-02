import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { componentSurface } from '../../fixtures/public-surface';

const UNIVERSAL_SUITES = ['a11y', 'behavior', 'determinism'] as const;

function suitePath(name: string, file: string): string {
  return join(process.cwd(), 'tests', 'browser', 'components', name, file);
}

describe('component correctness matrix', () => {
  it('should not leave dormant vitest browser suites', () => {
    const browserDirectory = join(process.cwd(), 'tests', 'browser');
    const dormantSuites = readdirSync(browserDirectory, { recursive: true })
      .map(String)
      .filter((file) => /\.test\.tsx?$/.test(file))
      .sort();

    expect(dormantSuites).toEqual([]);
  });

  it('should require accessibility, behavior, and determinism suites for every public family', () => {
    for (const { name } of componentSurface) {
      for (const suite of UNIVERSAL_SUITES) {
        const key = `${name}/${suite}`;
        const spec = suitePath(name, `${suite}.spec.ts`);

        expect(
          existsSync(spec),
          `${key} is missing coverage in the Playwright lane (${suite}.spec.ts)`
        ).toBe(true);
        expect(readFileSync(spec, 'utf8')).toMatch(/\btest\s*\(/);
      }
    }
  });
});
