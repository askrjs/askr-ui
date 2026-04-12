import * as foundations from '@askrjs/askr/foundations';

const runtimeRequiredExports = [
  'Presence',
  'pressable',
  'focusable',
  'dismissable',
  'rovingFocus',
  'mergeProps',
  'composeRefs',
  'controllableState',
];

const missingExports = runtimeRequiredExports.filter(
  (exportName) => !(exportName in foundations)
);

if (missingExports.length > 0) {
  console.error(
    [
      'Foundations contract verification failed.',
      `Missing exports: ${missingExports.join(', ')}`,
    ].join('\n')
  );
  process.exit(1);
}

console.log(
  `Foundations contract verified: ${runtimeRequiredExports.length} runtime exports present.`
);