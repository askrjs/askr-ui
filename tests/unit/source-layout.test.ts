import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { componentSurface } from './fixtures/public-surface';

function readComponentDirectories() {
  return readdirSync(join(process.cwd(), 'src', 'components'), {
    withFileTypes: true,
  })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

describe('Source layout', () => {
  it('should keeps the component tree flat and one folder per public component', () => {
    const expectedDirectories = [
      ...componentSurface.map((entry) => entry.name),
      '_internal',
    ].sort();

    expect(readComponentDirectories()).toEqual(expectedDirectories);

    for (const { name } of componentSurface) {
      expect(
        existsSync(join(process.cwd(), 'src', 'components', name, 'index.ts'))
      ).toBe(true);
    }
  });
});
