import { expect, test } from '../../fixtures';

test.describe('Cross-component contracts', () => {
  test('should preserve internal values and current callbacks across controlled mode transitions', async ({
    render,
    root,
    run,
  }) => {
    await render('controlledToUncontrolled');
    const checkbox = root.locator('[data-slot="checkbox"]');
    const alpha = root.getByRole('radio', { name: 'Alpha' });
    const beta = root.getByRole('radio', { name: 'Beta' });
    const value = root.locator('input[name="workspace"]');
    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveAttribute('data-state', 'checked');
    await expect(beta).toHaveAttribute('aria-checked', 'true');
    await expect(value).toHaveValue('beta');
    await checkbox.click();
    await alpha.click();
    await expect(checkbox).toBeChecked();
    await expect(beta).toHaveAttribute('data-state', 'checked');
    await expect(value).toHaveValue('beta');
    await run('clearValues');
    await expect(checkbox).not.toBeChecked();
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    await expect(alpha).toHaveAttribute('aria-checked', 'true');
    await expect(value).toHaveValue('alpha');
    await checkbox.click();
    await beta.click();
    await expect(checkbox).toBeChecked();
    await expect(beta).toHaveAttribute('aria-checked', 'true');
    await expect(value).toHaveValue('beta');
    await run('defineValues');
    await expect(checkbox).not.toBeChecked();
    await expect(alpha).toHaveAttribute('aria-checked', 'true');
    await expect(value).toHaveValue('alpha');
    await checkbox.click();
    await beta.click();
    await expect(checkbox).not.toBeChecked();
    await expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    await expect(alpha).toHaveAttribute('data-state', 'checked');
    await expect(value).toHaveValue('alpha');
    expect(await run('sameNodes')).toBe(true);
    expect(await run('requests')).toEqual([
      { control: 'checkbox', next: false, phase: 0 },
      { control: 'radio', next: 'alpha', phase: 0 },
      { control: 'checkbox', next: true, phase: 1 },
      { control: 'radio', next: 'beta', phase: 1 },
      { control: 'checkbox', next: true, phase: 2 },
      { control: 'radio', next: 'beta', phase: 2 },
    ]);
  });

  test('should dismiss nested portals inner-first and restore focus one owner at a time', async ({
    page,
    render,
    run,
  }) => {
    await render('nestedOverlays');
    const outerTrigger = page.getByRole('button', { name: 'Open outer' });
    await outerTrigger.focus();
    await outerTrigger.press('Enter');
    const innerTrigger = page.getByRole('button', {
      name: 'More',
      exact: true,
    });
    await page.getByRole('button', { name: 'Inner action' }).focus();
    await run('clearRequests');
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(0);
    await expect(innerTrigger).toBeFocused();
    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(1);
    expect(await run('requests')).toEqual([{ owner: 'inner', open: false }]);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(0);
    await expect(outerTrigger).toBeFocused();
    expect(await run('requests')).toEqual([
      { owner: 'inner', open: false },
      { owner: 'outer', open: false },
    ]);
  });

  for (const removeTrigger of [false, true]) {
    test(`should clean nested portals on outer-first removal with ${removeTrigger ? 'an explicit persistent target' : 'a surviving trigger'}`, async ({
      page,
      render,
      run,
    }) => {
      await render('nestedOverlays', { removeTrigger });
      const outerTrigger = page.getByRole('button', { name: 'Open outer' });
      await outerTrigger.focus();
      await outerTrigger.press('Enter');
      await page.getByRole('button', { name: 'Inner action' }).focus();
      await run('clearRequests');
      await run('closeOuter');
      await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(0);
      await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(
        0
      );
      await expect(
        page.getByRole('button', {
          name: removeTrigger ? 'Persistent restore target' : 'Open outer',
          exact: true,
        })
      ).toBeFocused();
      expect(await run('detached')).toEqual({
        outer: true,
        inner: true,
        staleFocus: 0,
      });
      expect(await run('requests')).toEqual([]);
      const survivor = page.getByRole('button', {
        name: 'Survivor',
        exact: true,
      });
      await survivor.click();
      await page.getByRole('button', { name: 'Surviving action' }).focus();
      await run('clearRequests');
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(
        0
      );
      await expect(survivor).toBeFocused();
      expect(await run('requests')).toEqual([
        { owner: 'survivor', open: false },
      ]);
      expect(await run('detached')).toEqual({
        outer: true,
        inner: true,
        staleFocus: 0,
      });
    });
  }

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
