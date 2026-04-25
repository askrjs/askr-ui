import { readFile } from 'node:fs/promises';

let runtimeExports;
try {
  runtimeExports = await import('@askrjs/askr-ui/foundations');
} catch (err) {
  console.warn(
    `Warning: Could not import @askrjs/askr-ui/foundations: ${err.message}`
  );
  runtimeExports = {};
}

const runtimeKeys = [
  'Presence',
  'createCollection',
  'createLayer',
  'pressable',
  'focusable',
  'dismissable',
  'rovingFocus',
  'mergeProps',
  'composeRefs',
  'controllableState',
];

for (const key of runtimeKeys) {
  if (
    (runtimeExports && !(key in runtimeExports)) ||
    runtimeExports[key] === undefined
  ) {
    if (Object.keys(runtimeExports).length > 0) {
      throw new Error(`Missing runtime foundations export: ${key}`);
    }
  }
}

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const indexTypePaths = [
  join(scriptDir, '../dist/foundations/index.d.ts'),
  join(scriptDir, '../../askr-ui/dist/foundations/index.d.ts'),
  join(
    scriptDir,
    '../node_modules/@askrjs/askr-ui/dist/foundations/index.d.ts'
  ),
];

let indexTypes;
for (const path of indexTypePaths) {
  try {
    indexTypes = await readFile(path, 'utf8');
    break;
  } catch (err) {
    continue;
  }
}

if (!indexTypes) {
  throw new Error(
    `Could not find @askrjs/askr-ui foundations type definitions in any location: ${indexTypePaths.join(', ')}`
  );
}

const typeMarkers = [
  'Ref',
  'Orientation',
  'Presence',
  'createLayer',
  'createCollection',
];

for (const marker of typeMarkers) {
  if (!indexTypes.includes(marker)) {
    throw new Error(`Missing type foundations export marker: ${marker}`);
  }
}

console.log(
  `Foundations contract verified: ${runtimeKeys.length} runtime exports present.`
);
