import { execFileSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { readPackRecord } from './pack-record.mjs';

const root = process.cwd();
const temporary = mkdtempSync(join(tmpdir(), 'askr-ui-pack-'));

try {
  const packed = readPackRecord(
    execFileSync(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary],
      { cwd: root, encoding: 'utf8' }
    )
  );
  const forbidden =
    /(?:^|\/)(?:node_modules|\.cache|coverage)(?:\/|$)|\.tsbuildinfo$/;
  const files = packed.files.map(({ path }) => path);
  const rejected = files.filter(
    (path) => forbidden.test(path) || /\.(?:cjs|cts)(?:\.map)?$/.test(path)
  );
  if (rejected.length > 0)
    throw new Error(`Forbidden packed files:\n${rejected.join('\n')}`);
  const absent = [
    'CHANGELOG.md',
    'README.md',
    'LICENSE',
    'package.json',
  ].filter((path) => !files.includes(path));
  if (absent.length > 0)
    throw new Error(`Packed artifact is missing:\n${absent.join('\n')}`);

  const packageJson = JSON.parse(
    readFileSync(join(root, 'package.json'), 'utf8')
  );
  function exportTargets(value) {
    if (typeof value === 'string') return [value];
    if (!value || typeof value !== 'object') return [];
    return Object.values(value).flatMap(exportTargets);
  }
  const missing = exportTargets(packageJson.exports).filter(
    (target) =>
      !existsSync(resolve(root, target)) ||
      !files.includes(target.replace(/^\.\//, ''))
  );
  if (missing.length > 0)
    throw new Error(
      `Missing on-disk or packed export targets:\n${missing.join('\n')}`
    );
  const contract = JSON.parse(
    readFileSync(join(root, 'tests/fixtures/0.5.0-public-exports.json'), 'utf8')
  );
  const privatePaths = JSON.parse(
    readFileSync(join(root, 'tests/fixtures/0.5.0-private-paths.json'), 'utf8')
  );
  if (
    JSON.stringify(Object.keys(packageJson.exports).sort()) !==
    JSON.stringify([...contract.exportKeys].sort())
  ) {
    throw new Error(
      'Packed entrypoints differ from the reviewed 36-key contract.'
    );
  }

  const consumer = join(temporary, 'consumer');
  mkdirSync(consumer);
  writeFileSync(
    join(consumer, 'package.json'),
    JSON.stringify({
      private: true,
      type: 'module',
      dependencies: {
        '@askrjs/askr': `file:${join(root, 'node_modules/@askrjs/askr')}`,
        '@askrjs/ui': `file:${join(temporary, basename(packed.filename))}`,
      },
    })
  );
  const fixtures = [
    'tests/unit/types/0.5.0-retained.type-test.ts',
    'tests/unit/types/0.5.0-removed.type-test.ts',
    'tests/fixtures/0.5.0-private-paths.type-test.ts',
    'tests/fixtures/0.5.0-require.type-test.cts',
  ];
  for (const fixture of fixtures)
    copyFileSync(join(root, fixture), join(consumer, basename(fixture)));
  writeFileSync(join(consumer, 'contract.json'), JSON.stringify(contract));
  writeFileSync(
    join(consumer, 'private-paths.json'),
    JSON.stringify(privatePaths)
  );
  writeFileSync(
    join(consumer, 'consumer.mjs'),
    `
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const contract = JSON.parse(readFileSync(new URL('./contract.json', import.meta.url), 'utf8'));
const privatePaths = JSON.parse(readFileSync(new URL('./private-paths.json', import.meta.url), 'utf8'));
const root = await import('@askrjs/ui');
let pairs = 0;
for (const [subpath, expected] of Object.entries(contract.entries)) {
  const path = '@askrjs/ui' + (subpath === '.' ? '' : subpath.slice(1));
  const entry = await import(path);
  const commonjs = require(path);
  assert.deepEqual(Object.keys(commonjs).sort(), expected.values, path + ':require');
  assert.deepEqual(Object.keys(entry).sort(), expected.values, path);
  for (const name of expected.values) {
    assert.equal(typeof entry[name], 'function', path + ':' + name);
    assert.equal(entry[name], root[name], path + ':' + name);
    assert.equal(commonjs[name], entry[name], path + ':require:' + name);
    pairs += 1;
  }
  for (const name of expected.removedValues) assert.equal(name in entry, false, path + ':' + name);
}
for (const path of privatePaths) {
  await assert.rejects(() => import(path), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
  assert.throws(() => require(path), { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' });
}
assert.equal(pairs, 254);
console.log('ESM and native require: 254 retained value/path identities, 54 removed value/path pairs, private paths rejected');
`
  );
  writeFileSync(
    join(consumer, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        target: 'ES2022',
        lib: ['ES2022', 'DOM'],
        strict: true,
        types: [],
        skipLibCheck: false,
        noEmit: true,
      },
      files: fixtures.map((fixture) => basename(fixture)),
    })
  );
  execFileSync(
    'npm',
    ['install', '--ignore-scripts', '--no-audit', '--no-fund'],
    { cwd: consumer, stdio: 'inherit' }
  );
  execFileSync(process.execPath, ['consumer.mjs'], {
    cwd: consumer,
    stdio: 'inherit',
  });
  for (const compiler of [
    join(root, 'node_modules/@typescript/typescript6/bin/tsc6'),
    join(root, 'node_modules/typescript/bin/tsc'),
  ]) {
    console.log(
      execFileSync(process.execPath, [compiler, '--version'], {
        encoding: 'utf8',
      }).trim() +
        ': ' +
        compiler
    );
    execFileSync(process.execPath, [compiler, '-p', 'tsconfig.json'], {
      cwd: consumer,
      stdio: 'inherit',
    });
  }
  console.log(
    `Validated ${files.length} packed files, all recursive export targets, 864 positive/106 negative names, private paths, and isolated ESM/native require identities and declarations under TS6/7.`
  );
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
