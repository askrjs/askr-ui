import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { componentSurface } from '../../fixtures/public-surface';

const UNIVERSAL_SUITES = ['a11y', 'behavior', 'determinism'] as const;

describe('component correctness matrix', () => {
  it('should require accessibility, behavior, and determinism suites for every public family', () => {
    for (const { name } of componentSurface) {
      for (const suite of UNIVERSAL_SUITES) {
        const path = join(
          process.cwd(),
          'tests',
          'browser',
          'components',
          name,
          `${suite}.test.tsx`
        );
        expect(existsSync(path), `${name} is missing ${suite} coverage`).toBe(
          true
        );
        expect(readFileSync(path, 'utf8')).toMatch(/\b(?:it|test)\s*\(/);
      }
    }
  });
});
