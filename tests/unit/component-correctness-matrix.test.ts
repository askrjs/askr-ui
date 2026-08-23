import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { componentSurface } from './fixtures/public-surface';

const UNIVERSAL_DIMENSIONS = [
  'accessibility',
  'behavior',
  'determinism',
  'disabled',
  'lifecycle',
] as const;

const COMPOSITION_RISKS = {
  forms: [
    'button',
    'checkbox',
    'form',
    'input',
    'label',
    'radio-group',
    'select',
    'slider',
    'switch',
    'textarea',
  ],
  overlays: [
    'alert-dialog',
    'dialog',
    'dismissable-layer',
    'dropdown',
    'focus-scope',
    'hover-card',
    'menu',
    'popover',
    'toast',
    'tooltip',
  ],
  rovingFocus: [
    'accordion',
    'dropdown',
    'menu',
    'menubar',
    'radio-group',
    'select',
    'toggle-group',
  ],
  virtualization: [
    'avatar',
    'collapsible',
    'progress',
    'progress-circle',
    'scroll-area',
    'table',
    'toggle',
    'virtual-list',
    'virtual-table',
    'visually-hidden',
  ],
} as const;

describe('component correctness matrix', () => {
  it('should require accessibility, behavior, and determinism suites for every public family', () => {
    for (const { name } of componentSurface) {
      for (const suite of UNIVERSAL_DIMENSIONS.slice(0, 3)) {
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

  it('should keep every public family assigned to explicit hardening dimensions', () => {
    const publicFamilies = componentSurface.map(({ name }) => name).sort();
    const assignedFamilies = new Set(Object.values(COMPOSITION_RISKS).flat());
    expect([...assignedFamilies].sort()).toEqual(publicFamilies);
    expect(UNIVERSAL_DIMENSIONS).toHaveLength(5);
  });

  it('should keep high-risk families attached to cross-component regression coverage', () => {
    const source = readFileSync(
      join(
        process.cwd(),
        'tests',
        'browser',
        'components',
        'cross-component',
        'behavior.test.tsx'
      ),
      'utf8'
    );
    for (const contract of [
      'controlled-to-uncontrolled',
      'nested overlays',
      'server-rendered component trees',
      'virtualized row identity',
      'identical composite ids',
    ]) {
      expect(source, `missing cross-component contract: ${contract}`).toContain(
        contract
      );
    }
  });
});
