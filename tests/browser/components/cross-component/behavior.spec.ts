import { expect, test } from '../../fixtures';

test.describe('Cross-component contracts', () => {
  test('should preserve controlled-to-uncontrolled state transitions given native controls when the value or checked prop changes from defined to undefined', async ({
    render,
    root,
    run,
  }) => {
    await render('controlledToUncontrolled');
    const checkbox = root.locator('[data-slot="checkbox"]');

    await expect(checkbox).toHaveAttribute('data-state', 'checked');

    await run('clearChecked');

    await expect(checkbox).toHaveCount(1);
  });

  test('should restore focus through nested overlays given dialog and popover content when overlays close in different orders', async ({
    page,
    render,
  }) => {
    await render('nestedOverlays');

    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(1);
    await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(1);
  });

  test('should preserve form state and nested overlays given mixed controls inside a modal when the form submits', async ({
    page,
    render,
    run,
  }) => {
    await render('formInsideModal');

    await run('focusCheckbox');
    await page.keyboard.press(' ');
    await run('focusSubmit');
    await page.keyboard.press('Enter');
    await run('flush');

    expect(await run<number>('submitCount')).toBe(1);
    expect(await run<string>('workspaceValue')).toBe('Production');
    await expect(page.locator('[data-slot="checkbox"]')).toHaveAttribute(
      'data-state',
      'unchecked'
    );
    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(1);
    await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(1);
  });

  test('should hydrate asChild hosts without replacing nodes given server-rendered component trees when client props attach', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildHydration');

    expect(await run<string | null>('refTagName')).toBe('BUTTON');
    await expect(root.locator('[data-slot="popover-trigger"]')).toHaveCount(1);
  });

  test('should preserve virtualized row identity given reorder, resize, and scroll-anchor changes when data updates during virtualization', async ({
    render,
    root,
  }) => {
    await render('virtualizedRowIdentity');

    await expect(root.locator('[data-key="a"]')).toHaveCount(1);
    await expect(root.locator('[data-key="b"]')).toHaveCount(1);
  });

  test('should isolate identical composite ids while keeping each mounted identity stable', async ({
    render,
    run,
  }) => {
    await render('identicalCompositeIds');
    const slots = ['toggle-group-item', 'menu-item', 'menubar-trigger'];

    const initialIds = await run<Record<string, string[]>>('ids');
    for (const slot of slots) {
      await test.step(`initial ${slot} ids`, () => {
        expect(initialIds[slot]).toHaveLength(2);
        expect(new Set(initialIds[slot]).size).toBe(2);
      });
    }
    expect(await run<string | null>('firstMenuItemId')).not.toBe(
      'menu-explicit-menu-item-0'
    );
    expect(await run<string | null>('explicitMenuItemId')).toBe(
      'menu-explicit-menu-item-0'
    );

    await run('rerender');

    const rerenderedIds = await run<Record<string, string[]>>('ids');
    for (const slot of slots) {
      await test.step(`rerendered ${slot} ids`, () => {
        expect(rerenderedIds[slot]).toEqual(initialIds[slot]);
      });
    }

    const firstToggleId = initialIds['toggle-group-item'][0];
    expect(await run<string | null>('remountSingleToggle')).toBe(firstToggleId);
  });
});
