import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import * as api from '../../src';

const FORBIDDEN_NAME = /^(?:use[A-Z].*|.*Provider|defineContext|readContext)$/;
const FORBIDDEN_TEXT = /\b(?:use[A-Z][A-Za-z0-9_]*|[A-Za-z][A-Za-z0-9_]*Provider|defineContext|readContext)\b/;

function publicFiles(path: string): string[] {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).flatMap((entry) => publicFiles(join(path, entry)));
}

describe('React-free public surface', () => {
  it('should not export hook- or provider-shaped runtime names', () => {
    expect(Object.keys(api).filter((name) => FORBIDDEN_NAME.test(name))).toEqual([]);
  });

  it('should keep public documentation free of hook and provider vocabulary', () => {
    const roots = ['README.md', 'docs'].map((path) => join(process.cwd(), path));
    const violations = roots
      .flatMap(publicFiles)
      .filter((path) => FORBIDDEN_TEXT.test(readFileSync(path, 'utf8')));
    expect(violations).toEqual([]);
  });
});
