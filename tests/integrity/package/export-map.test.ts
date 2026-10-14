import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';

type ConditionalExportTarget = {
  import: { types: string; default: string };
  require: { types: string; default: string };
};
const packageJson = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8')
) as {
  exports: Record<string, ConditionalExportTarget | string>;
};
const contract = JSON.parse(
  readFileSync(
    join(process.cwd(), 'tests/fixtures/0.5.0-public-exports.json'),
    'utf8'
  )
) as {
  exportKeys: string[];
  entries: Record<string, { values: string[]; removedValues: string[] }>;
};

describe('Package exports', () => {
  it('should publish exactly the reviewed 36 root, family, and metadata entrypoints', () => {
    expect(Object.keys(packageJson.exports).sort()).toEqual(
      [...contract.exportKeys].sort()
    );
    expect(contract.exportKeys).toHaveLength(36);
    expect(packageJson.exports['.']).toEqual({
      import: { types: './dist/index.d.ts', default: './dist/index.js' },
      require: { types: './dist/index.d.ts', default: './dist/index.js' },
    });
    for (const subpath of Object.keys(contract.entries).filter(
      (path) => path !== '.'
    )) {
      const prefix = `./dist/components/${subpath.slice(2)}/index`;
      expect(packageJson.exports[subpath], subpath).toEqual({
        import: { types: `${prefix}.d.ts`, default: `${prefix}.js` },
        require: { types: `${prefix}.d.ts`, default: `${prefix}.js` },
      });
    }
    expect(packageJson.exports['./package.json']).toBe('./package.json');
  });

  it('should retain every reviewed ESM value and exact root/family identity', () => {
    const targets = Object.entries(contract.entries).map(
      ([subpath, expected]) => {
        const target = packageJson.exports[subpath] as ConditionalExportTarget;
        return {
          subpath,
          ...expected,
          esmPath: join(
            process.cwd(),
            typeof target.import === 'string'
              ? target.import
              : target.import.default
          ),
        };
      }
    );
    const output = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        `
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
const targets = JSON.parse(process.argv[1]);
const root = await import(pathToFileURL(targets.find(t => t.subpath === '.').esmPath).href);
for (const target of targets) {
  const entry = await import(pathToFileURL(target.esmPath).href);
  assert.deepEqual(Object.keys(entry).sort(), target.values, target.subpath);
  for (const name of target.values) {
    assert.equal(typeof entry[name], 'function', target.subpath + ':' + name);
    assert.equal(entry[name], root[name], target.subpath + ':' + name);
  }
  for (const name of target.removedValues) assert.equal(name in entry, false, name);
}
process.stdout.write(JSON.stringify({ paths: targets.length, pairs: targets.reduce((n,t) => n+t.values.length, 0) }));
`,
        JSON.stringify(targets),
      ],
      { cwd: process.cwd(), encoding: 'utf8' }
    );
    expect(JSON.parse(output)).toEqual({ paths: 35, pairs: 254 });
  });
});
