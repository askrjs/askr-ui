import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { componentSurface } from './fixtures/public-surface';

const UNIVERSAL_SUITES = ['a11y', 'behavior', 'determinism'] as const;

const SPECIALIZED_EVIDENCE = [
  {
    dimension: 'controlled-state transitions',
    file: 'tests/browser/components/cross-component/behavior.test.tsx',
    contracts: ['controlled-to-uncontrolled state transitions'],
  },
  {
    dimension: 'nested overlay lifecycle',
    file: 'tests/browser/components/cross-component/behavior.test.tsx',
    contracts: ['nested overlays', 'mixed controls inside a modal'],
  },
  {
    dimension: 'roving focus and disabled repair',
    file: 'tests/unit/source-layout.test.ts',
    contracts: ['repairFocusForDisabledItem', 'becomes disabled'],
  },
  {
    dimension: 'async teardown',
    file: 'tests/browser/components/hover-card/behavior.test.tsx',
    contracts: [
      'repeated timer churn',
      'both transition timers during teardown',
    ],
  },
  {
    dimension: 'native form submission and reset',
    file: 'tests/browser/components/form/behavior.test.tsx',
    contracts: ['submit and reset native controls'],
  },
  {
    dimension: 'virtualization identity',
    file: 'tests/browser/components/cross-component/behavior.test.tsx',
    contracts: ['virtualized row identity'],
  },
  {
    dimension: 'server/client composition',
    file: 'tests/browser/components/cross-component/behavior.test.tsx',
    contracts: ['server-rendered component trees', 'identical composite ids'],
  },
] as const;

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

  it('should attach every specialized risk to executable regression evidence', () => {
    for (const evidence of SPECIALIZED_EVIDENCE) {
      const path = join(process.cwd(), evidence.file);
      expect(existsSync(path), evidence.dimension).toBe(true);
      const source = readFileSync(path, 'utf8');
      for (const contract of evidence.contracts) {
        expect(
          source,
          `${evidence.dimension} is missing contract: ${contract}`
        ).toContain(contract);
      }
    }
  });
});
