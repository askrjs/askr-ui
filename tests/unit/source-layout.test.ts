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
        const source = readFileSync(path, 'utf8');
        for (const tag of source.matchAll(/<button\b[\s\S]*?>/g)) {
          if (!tag[0].includes('nativeButtonProps(')) {
            rawNativeButtons.push(`${directory}/${entry.name}`);
          }
        }
      }
    }

    expect(rawNativeButtons).toEqual([]);
    const sharedControl = readFileSync(
      join(componentsDirectory, '_internal', 'native-control.ts'),
      'utf8'
    );
    expect(sharedControl).toContain("font: 'inherit'");
  });

  it('should keep roving composites on the shared identity and focus guardrails', () => {
    const componentsDirectory = join(process.cwd(), 'src', 'components');
    const missingFocusRepair: string[] = [];

    for (const directory of readComponentDirectories()) {
      if (directory === '_internal') continue;
      const componentDirectory = join(componentsDirectory, directory);
      for (const entry of readdirSync(componentDirectory, {
        withFileTypes: true,
      })) {
        if (!entry.isFile() || !entry.name.endsWith('.tsx')) continue;
        const path = join(componentDirectory, entry.name);
        const source = readFileSync(path, 'utf8');
        const ownsRovingItems =
          source.includes('rovingFocus({') &&
          source.includes('const interactionProps = pressable');

        if (ownsRovingItems && !source.includes('repairFocusForDisabledItem')) {
          missingFocusRepair.push(`${directory}/${entry.name}`);
        }
      }
    }

    const menuItem = readFileSync(
      join(componentsDirectory, 'menu', 'menu-item.tsx'),
      'utf8'
    );
    expect(menuItem).toContain('repairFocusForDisabledItem');
    expect(missingFocusRepair).toEqual([]);

    const behaviorSuites = [
      'accordion',
      'dropdown',
      'menu',
      'menubar',
      'radio-group',
      'select',
      'toggle-group',
    ];
    for (const suite of behaviorSuites) {
      const source = readFileSync(
        join(
          process.cwd(),
          'tests',
          'browser',
          'components',
          suite,
          'behavior.test.tsx'
        ),
        'utf8'
      );
      expect(source).toContain('document.activeElement');
      expect(source).toMatch(/Arrow(?:Down|Up|Left|Right)/);
      expect(source).toContain('becomes disabled');
    }

    const identitySource = readFileSync(
      join(componentsDirectory, '_internal', 'id.ts'),
      'utf8'
    );
    expect(identitySource).toContain('activeAutoIdOrdinals');
    expect(identitySource).toContain("addEventListener(\n    'abort'");
    expect(identitySource).not.toMatch(/Math\.random|randomUUID/);
  });
});
