import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { componentSurface } from '../../fixtures/public-surface';

const UNIVERSAL_SUITES = ['a11y', 'behavior', 'determinism'] as const;

/**
 * Public-family suites that still exist only as vitest browser-mode
 * `.test.tsx` files. No configured lane runs those files: the Playwright lane
 * matches `*.spec.ts` only. They are listed here so the gap stays visible and
 * can only shrink. Port a suite to `<suite>.spec.ts` plus its scenario module,
 * then remove its entry. A new family must ship Playwright specs.
 */
const UNPORTED_LEGACY_SUITES = new Set([
  'input/a11y',
  'input/behavior',
  'input/determinism',
]);

function suitePath(name: string, file: string): string {
  return join(process.cwd(), 'tests', 'browser', 'components', name, file);
}

describe('component correctness matrix', () => {
  it('should require accessibility, behavior, and determinism suites for every public family', () => {
    for (const { name } of componentSurface) {
      for (const suite of UNIVERSAL_SUITES) {
        const key = `${name}/${suite}`;
        const spec = suitePath(name, `${suite}.spec.ts`);

        if (existsSync(spec)) {
          expect(
            UNPORTED_LEGACY_SUITES.has(key),
            `${key} has a Playwright spec; remove it from UNPORTED_LEGACY_SUITES`
          ).toBe(false);
          expect(readFileSync(spec, 'utf8')).toMatch(/\btest\s*\(/);
          continue;
        }

        expect(
          UNPORTED_LEGACY_SUITES.has(key),
          `${name} is missing ${suite} coverage in the Playwright lane (${suite}.spec.ts)`
        ).toBe(true);
        const legacy = suitePath(name, `${suite}.test.tsx`);
        expect(existsSync(legacy), `${name} is missing ${suite} coverage`).toBe(
          true
        );
        expect(readFileSync(legacy, 'utf8')).toMatch(/\b(?:it|test)\s*\(/);
      }
    }
  });

  it('should only list public-family suites in the unported backlog', () => {
    const known = new Set(
      componentSurface.flatMap(({ name }) =>
        UNIVERSAL_SUITES.map((suite) => `${name}/${suite}`)
      )
    );
    expect(
      [...UNPORTED_LEGACY_SUITES].filter((key) => !known.has(key))
    ).toEqual([]);
  });
});
