import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
  it('should keep the component tree flat and one folder per public component', () => {
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

  it('should route every component-owned native button through the shared typography reset', () => {
    const componentsDirectory = join(process.cwd(), 'src', 'components');
    const rawNativeButtons: string[] = [];

    for (const directory of readComponentDirectories()) {
      if (directory === '_internal') continue;
      const componentDirectory = join(componentsDirectory, directory);
      for (const entry of readdirSync(componentDirectory, {
        withFileTypes: true,
      })) {
        if (!entry.isFile() || !entry.name.endsWith('.tsx')) continue;
        const path = join(componentDirectory, entry.name);
        if (/<button\b/.test(readFileSync(path, 'utf8'))) {
          rawNativeButtons.push(`${directory}/${entry.name}`);
        }
      }
    }

    expect(rawNativeButtons).toEqual([]);
    const sharedControl = readFileSync(
      join(componentsDirectory, '_internal', 'native-control.tsx'),
      'utf8'
    );
    expect(sharedControl).toContain("font: 'inherit'");
  });
});
