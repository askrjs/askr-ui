import { describe, expect, it } from 'vite-plus/test';
// @ts-expect-error -- plain .mjs build script without declarations
import { readPackRecord } from '../../../scripts/pack-record.mjs';

const record = {
  id: '@askrjs/ui@0.4.0',
  name: '@askrjs/ui',
  filename: 'askrjs-ui-0.4.0.tgz',
  files: [{ path: 'CHANGELOG.md' }, { path: 'package.json' }],
};

describe('readPackRecord (npm pack --json)', () => {
  it('should read the npm <=11 shape: an array of pack records', () => {
    expect(readPackRecord(JSON.stringify([record]))).toEqual(record);
  });

  it('should read the npm 12 shape: records keyed by package name', () => {
    expect(readPackRecord(JSON.stringify({ '@askrjs/ui': record }))).toEqual(
      record
    );
  });

  it.each([
    ['an empty array', '[]'],
    ['an empty object', '{}'],
    ['two records', JSON.stringify([record, record])],
    ['a record without files', JSON.stringify([{ name: '@askrjs/ui' }])],
    ['a non-object', '"@askrjs/ui"'],
  ])('should reject %s with a clear error', (_label, output) => {
    expect(() => readPackRecord(output)).toThrow(/npm pack --json/);
  });
});
