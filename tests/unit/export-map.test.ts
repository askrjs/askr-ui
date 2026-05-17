import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

type ExportTarget = {
  types: string;
  import: string;
  require: string;
};

function expectExportTarget(
  actual: unknown,
  expected: ExportTarget,
  label: string
) {
  expect(actual, `${label} is missing`).toEqual(expected);
}

describe('Package exports', () => {
  it('publishes the curated root and direct component entrypoints only', () => {
    const packageJson = JSON.parse(
      readFileSync(join(process.cwd(), 'package.json'), 'utf8')
    ) as { exports: Record<string, unknown> };

    expectExportTarget(
      packageJson.exports['.'],
      {
        types: './dist/index.d.ts',
        import: './dist/index.js',
        require: './dist/index.cjs',
      },
      'root export'
    );

    expectExportTarget(
      packageJson.exports['./button'],
      {
        types: './dist/components/button/index.d.ts',
        import: './dist/components/button/index.js',
        require: './dist/components/button/index.cjs',
      },
      'button export'
    );

    expectExportTarget(
      packageJson.exports['./dialog'],
      {
        types: './dist/components/dialog/index.d.ts',
        import: './dist/components/dialog/index.js',
        require: './dist/components/dialog/index.cjs',
      },
      'dialog export'
    );

    expectExportTarget(
      packageJson.exports['./virtual-list'],
      {
        types: './dist/components/virtual-list/index.d.ts',
        import: './dist/components/virtual-list/index.js',
        require: './dist/components/virtual-list/index.cjs',
      },
      'virtual-list export'
    );

    expectExportTarget(
      packageJson.exports['./virtual-table'],
      {
        types: './dist/components/virtual-table/index.d.ts',
        import: './dist/components/virtual-table/index.js',
        require: './dist/components/virtual-table/index.cjs',
      },
      'virtual-table export'
    );

    expect(packageJson.exports['./package.json']).toBe('./package.json');

    const exportKeys = Object.keys(packageJson.exports);
    expect(exportKeys.some((key) => key.startsWith('./components'))).toBe(
      false
    );
    expect(exportKeys.some((key) => key.startsWith('./primitives'))).toBe(
      false
    );
    expect(exportKeys.some((key) => key.startsWith('./composites'))).toBe(
      false
    );
    expect(exportKeys.some((key) => key.startsWith('./_internal'))).toBe(false);
  });
});
