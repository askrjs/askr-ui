import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

type ExportTarget = {
  types: string;
  import: string;
  require: string;
};

type ConditionalExportTarget = {
  import: { types: string; default: string };
  require: { types: string; default: string };
};

type PackageJson = {
  exports: Record<string, ExportTarget | ConditionalExportTarget | string>;
};

function expectExportTarget(
  actual: unknown,
  expected: ExportTarget | ConditionalExportTarget,
  label: string
) {
  expect(actual, `${label} is missing`).toEqual(expected);
}

function readPackageJson(): PackageJson {
  return JSON.parse(
    readFileSync(join(process.cwd(), 'package.json'), 'utf8')
  ) as PackageJson;
}

describe('Package exports', () => {
  it('should publishes the curated root and direct component entrypoints only', () => {
    const packageJson = readPackageJson();

    expectExportTarget(
      packageJson.exports['.'],
      {
        import: {
          types: './dist/index.d.ts',
          default: './dist/index.js',
        },
        require: {
          types: './dist/index.d.cts',
          default: './dist/index.cjs',
        },
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

  it('should emit ESM runtime exports for every public subpath entry', async () => {
    const packageJson = readPackageJson();
    const targets = Object.entries(packageJson.exports)
      .filter(
        (
          entry
        ): entry is [string, ExportTarget | ConditionalExportTarget] =>
          entry[0] !== './package.json' && typeof entry[1] !== 'string'
      )
      .map(([subpath, target]) => ({
        subpath,
        esmPath: join(
          process.cwd(),
          typeof target.import === 'string'
            ? target.import
            : target.import.default
        ),
      }));

    const output = execFileSync(
      process.execPath,
      [
        '-e',
        `
const { pathToFileURL } = require('node:url');
const targets = JSON.parse(process.argv[1]);

(async () => {
  const results = [];
  for (const target of targets) {
    const esmModule = await import(pathToFileURL(target.esmPath).href);
    const esmExports = Object.keys(esmModule).filter((key) => key !== 'default').sort();

    results.push({
      subpath: target.subpath,
      esmExports,
    });
  }

  process.stdout.write(JSON.stringify(results));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
        `,
        JSON.stringify(targets),
      ],
      { cwd: process.cwd(), encoding: 'utf8' }
    );
    const results = JSON.parse(output) as Array<{
      subpath: string;
      esmExports: string[];
    }>;

    for (const result of results) {
      expect(
        result.esmExports,
        `${result.subpath} ESM exports`
      ).not.toHaveLength(0);
    }
  });
});
