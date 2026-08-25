import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { componentSurface } from '../../fixtures/public-surface';

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

  it('should route every component-owned native button through the shared theme marker', () => {
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
    expect(sharedControl).toContain("'data-askr-native-control': 'true'");
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
    expect(identitySource).toContain('readVirtualCompositeIdentity');
    expect(identitySource).toMatch(/addEventListener\(\s*'abort'/);
    expect(identitySource).not.toMatch(/Math\.random|randomUUID/);

    const virtualListSource = readFileSync(
      join(componentsDirectory, 'virtual-list', 'virtual-list.tsx'),
      'utf8'
    );
    const virtualTableSource = readFileSync(
      join(componentsDirectory, 'virtual-table', 'virtual-table.tsx'),
      'utf8'
    );
    expect(virtualListSource).toContain('VirtualCompositeIdentityContext');
    expect(virtualListSource).toContain("'list-row'");
    expect(virtualTableSource).toContain('VirtualCompositeIdentityContext');
    expect(virtualTableSource).toContain("'table-cell'");

    const virtualizedCompositeSuite = readFileSync(
      join(
        process.cwd(),
        'tests',
        'browser',
        'components',
        'virtualized-composites',
        'behavior.test.tsx'
      ),
      'utf8'
    );
    for (const component of [
      'Dropdown',
      'Menu',
      'Menubar',
      'RadioGroup',
      'Select',
      'ToggleGroup',
    ]) {
      expect(virtualizedCompositeSuite).toContain(component);
    }
    expect(virtualizedCompositeSuite).toContain('VirtualList');
    expect(virtualizedCompositeSuite).toContain('VirtualTable');
  });

  it('should resync every named form primitive on a native form reset', () => {
    const componentsDirectory = join(process.cwd(), 'src', 'components');
    const missingFormReset: string[] = [];

    for (const directory of readComponentDirectories()) {
      if (directory === '_internal') continue;
      const componentDirectory = join(componentsDirectory, directory);
      const entries = readdirSync(componentDirectory, { withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name);
      const declaresName = entries.some(
        (name) =>
          name.endsWith('.types.ts') &&
          /\bname\?:\s*string/.test(
            readFileSync(join(componentDirectory, name), 'utf8')
          )
      );

      if (!declaresName) continue;
      const bindsFormReset = entries.some(
        (name) =>
          (name.endsWith('.ts') || name.endsWith('.tsx')) &&
          readFileSync(join(componentDirectory, name), 'utf8').includes(
            'formResetRef'
          )
      );

      if (!bindsFormReset) {
        missingFormReset.push(directory);
      }
    }

    expect(missingFormReset).toEqual([]);

    for (const suite of [
      'checkbox',
      'radio-group',
      'select',
      'slider',
      'switch',
    ]) {
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
      expect(source).toMatch(/\.reset\(\)|new Event\('reset'/);
    }
  });

  it('should keep component timer handles on re-render-safe cells', () => {
    const componentsDirectory = join(process.cwd(), 'src', 'components');
    const unsafeTimers: string[] = [];

    for (const directory of readComponentDirectories()) {
      const componentDirectory = join(componentsDirectory, directory);
      for (const entry of readdirSync(componentDirectory, {
        withFileTypes: true,
      })) {
        if (!entry.isFile()) continue;
        if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.tsx')) {
          continue;
        }
        const source = readFileSync(
          join(componentDirectory, entry.name),
          'utf8'
        );
        for (const assignment of source.matchAll(
          /(?:^|\n)\s*(?:(?:let|const|var)\s+)?([A-Za-z_$][\w$.]*)\s*=\s*set(?:Timeout|Interval)\(/g
        )) {
          const target = assignment[1] ?? '';
          const storedOnPersistentCell =
            target.includes('.') ||
            new RegExp(`[\\w$]+\\.[\\w$]+\\s*=\\s*${target}\\b`).test(source);

          if (!storedOnPersistentCell) {
            unsafeTimers.push(`${directory}/${entry.name}`);
          }
        }
      }
    }

    expect(unsafeTimers).toEqual([]);
  });

  it('should claim composite item ordinals through the virtualization-aware helper', () => {
    const componentsDirectory = join(process.cwd(), 'src', 'components');
    const unguardedClaims: string[] = [];

    for (const directory of readComponentDirectories()) {
      if (directory === '_internal') continue;
      const componentDirectory = join(componentsDirectory, directory);
      for (const entry of readdirSync(componentDirectory, {
        withFileTypes: true,
      })) {
        if (!entry.isFile() || !entry.name.endsWith('.tsx')) continue;
        const source = readFileSync(
          join(componentDirectory, entry.name),
          'utf8'
        );
        const claimsOrdinal =
          source.includes('claimItemIndex') ||
          source.includes('claimMenuIndex');
        const guardsRecycling =
          source.includes('claimVirtualCompositePlacement') ||
          source.includes('readVirtualCompositePlacement');

        if (claimsOrdinal && !guardsRecycling) {
          unguardedClaims.push(`${directory}/${entry.name}`);
        }
      }
    }

    expect(unguardedClaims).toEqual([]);
  });

  it('should route every roving composite through the direction-aware primitive', () => {
    const componentsDirectory = join(process.cwd(), 'src', 'components');
    const directImports: string[] = [];

    for (const directory of readComponentDirectories()) {
      if (directory === '_internal') continue;
      const componentDirectory = join(componentsDirectory, directory);
      for (const entry of readdirSync(componentDirectory, {
        withFileTypes: true,
      })) {
        if (!entry.isFile()) continue;
        if (!entry.name.endsWith('.ts') && !entry.name.endsWith('.tsx')) {
          continue;
        }
        const source = readFileSync(
          join(componentDirectory, entry.name),
          'utf8'
        );
        const importsRovingFocusValue =
          /import\s*\{[^}]*\brovingFocus\b[^}]*\}\s*from\s*'@askrjs\/askr\/foundations\/interactions'/s.test(
            source
          );

        if (importsRovingFocusValue) {
          directImports.push(`${directory}/${entry.name}`);
        }
      }
    }

    expect(directImports).toEqual([]);

    const rovingFocusSource = readFileSync(
      join(componentsDirectory, '_internal', 'roving-focus.ts'),
      'utf8'
    );
    expect(rovingFocusSource).toContain("=== 'rtl'");
    expect(rovingFocusSource).toContain('ArrowRight');
    expect(rovingFocusSource).toContain('ArrowLeft');

    for (const suite of [
      'dropdown',
      'menu',
      'menubar',
      'radio-group',
      'rtl-composites',
      'select',
      'toggle-group',
    ]) {
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
      expect(source).toContain('dir="rtl"');
    }
  });

  it('should keep overlay stack ordering in generated styles', () => {
    const dialogDirectory = join(process.cwd(), 'src', 'components', 'dialog');
    for (const file of ['dialog-content.tsx', 'dialog-overlay.tsx']) {
      const source = readFileSync(join(dialogDirectory, file), 'utf8');
      expect(source).not.toMatch(/\bstyle\s*:/);
      expect(source).not.toMatch(/\.style\b/);
    }

    const overlaySource = readFileSync(
      join(process.cwd(), 'src', 'components', '_internal', 'overlay.ts'),
      'utf8'
    );
    expect(overlaySource).toContain('primeOverlayStackNode');
    expect(overlaySource).toContain('setDynamicStyleRule');
  });

  it('should keep checkable roles on native checkable key semantics', () => {
    const componentsDirectory = join(process.cwd(), 'src', 'components');
    const checkableSources = [
      join(componentsDirectory, 'checkbox', 'checkbox.tsx'),
      join(componentsDirectory, 'switch', 'switch.tsx'),
      join(componentsDirectory, 'radio-group', 'radio-group-item.tsx'),
    ];

    for (const path of checkableSources) {
      const source = readFileSync(path, 'utf8');
      expect(source).toContain('checkablePress(');
      expect(source).not.toContain('isNativeButton');
    }

    const checkablePressSource = readFileSync(
      join(componentsDirectory, '_internal', 'checkable-press.ts'),
      'utf8'
    );
    expect(checkablePressSource).toContain("'Enter'");

    for (const suite of ['checkbox', 'switch', 'radio-group']) {
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
      expect(source).toContain('asChild');
      expect(source).toMatch(/\{Enter\}/);
    }
  });

  it('should keep async interaction families on lifecycle-specific browser guardrails', () => {
    const componentsDirectory = join(process.cwd(), 'src', 'components');
    const browserDirectory = join(
      process.cwd(),
      'tests',
      'browser',
      'components'
    );
    const hoverCardSuite = readFileSync(
      join(browserDirectory, 'hover-card', 'behavior.test.tsx'),
      'utf8'
    );
    expect(hoverCardSuite).toContain('pointer leaves immediately');
    expect(hoverCardSuite).toContain('pointer re-enters before its deadline');
    expect(hoverCardSuite).toContain('repeated timer churn');
    expect(hoverCardSuite).toContain('both transition timers during teardown');
    expect(hoverCardSuite).toContain('userEvent.hover(getPointerExitTarget())');

    const hoverCardSource = readFileSync(
      join(componentsDirectory, 'hover-card', 'hover-card.tsx'),
      'utf8'
    );
    expect(hoverCardSource).toContain("addEventListener('pointerover'");
    expect(hoverCardSource).toContain(
      "removeEventListener(\n            'pointerover'"
    );
    expect(hoverCardSource).toContain('clearOpenTimer()');

    const tooltipSuite = readFileSync(
      join(browserDirectory, 'tooltip', 'behavior.test.tsx'),
      'utf8'
    );
    expect(tooltipSuite).toContain('trigger.focus()');
    expect(tooltipSuite).toContain('await userEvent.tab()');
    expect(tooltipSuite).toContain('Button control');
    expect(tooltipSuite).toContain('HoverCard control');
    expect(tooltipSuite).toContain('controlled native-focus request bounded');
    expect(tooltipSuite).toContain('focus-adoption work during teardown');

    const toastSuite = readFileSync(
      join(browserDirectory, 'toast', 'behavior.test.tsx'),
      'utf8'
    );
    expect(toastSuite).toContain('unrelated paused toast through sibling');
    expect(toastSuite).toContain('toBe(original)');
    expect(toastSuite).toContain('toBe(originalClose)');

    const toastSource = readFileSync(
      join(componentsDirectory, 'toast', 'toast.tsx'),
      'utf8'
    );
    expect(toastSource).toContain('<For each={host.getToasts}');
    expect(toastSource).toContain(
      'by={(registration) => registration.toastId}'
    );
  });
});
