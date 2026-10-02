import { expect, test } from '../../fixtures';

interface RadioGroupContract {
  GROUP_ROLE: string;
  ITEM_ROLE: string;
  CHECKED_ATTRIBUTE: string;
  ORIENTATION_ATTRIBUTE: string;
}

test.describe('RadioGroup - Accessibility', () => {
  test('should have no automated axe violations for labelled native radio items', async ({
    render,
    axeViolations,
  }) => {
    await render('axeNative');

    expect(await axeViolations()).toEqual([]);
  });

  test('should have no automated axe violations for labelled asChild radio items', async ({
    render,
    axeViolations,
  }) => {
    await render('axeAsChild');

    expect(await axeViolations()).toEqual([]);
  });

  test('should expose radiogroup, orientation, and checked semantics', async ({
    render,
    root,
    run,
  }) => {
    await render('groupSemantics');
    const contract = await run<RadioGroupContract>('contract');
    const group = root.locator(`[role="${contract.GROUP_ROLE}"]`);
    const items = root.locator('[data-slot="radio-group-item"]');

    await expect(group).toHaveCount(1);
    await expect(group).toHaveAttribute('role', contract.GROUP_ROLE);
    await expect(group).toHaveAttribute(
      contract.ORIENTATION_ATTRIBUTE,
      'horizontal'
    );
    await expect(items.nth(0)).toHaveAttribute('role', contract.ITEM_ROLE);
    await expect(items.nth(0)).toHaveAttribute(
      contract.CHECKED_ATTRIBUTE,
      'false'
    );
    await expect(items.nth(1)).toHaveAttribute(
      contract.CHECKED_ATTRIBUTE,
      'true'
    );
  });

  test('should omit aria-orientation when orientation is both', async ({
    render,
    root,
    run,
  }) => {
    await render('bothOrientation');
    const contract = await run<RadioGroupContract>('contract');
    const group = root.locator('[data-slot="radio-group"]');

    await expect(group).toHaveCount(1);
    await expect(group).not.toHaveAttribute(contract.ORIENTATION_ATTRIBUTE);
  });

  test('should use disabled semantics for asChild radio items without native button support', async ({
    render,
    root,
  }) => {
    await render('disabledAsChild');
    const host = root.locator('[data-slot="radio-group-item"]');

    await expect(host).toHaveAttribute('aria-disabled', 'true');
    await expect(host).toHaveAttribute('tabindex', '-1');
  });

  test('should match the documented radio group accessibility contract', async ({
    render,
    run,
  }) => {
    await render('contract');

    expect(await run('contract')).toEqual({
      GROUP_ROLE: 'radiogroup',
      ITEM_ROLE: 'radio',
      CHECKED_ATTRIBUTE: 'aria-checked',
      ORIENTATION_ATTRIBUTE: 'aria-orientation',
      DATA_ATTRIBUTES: {
        slot: 'data-slot',
        state: 'data-state',
        disabled: 'data-disabled',
        orientation: 'data-orientation',
      },
      KEYBOARD_NAVIGATION: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'],
      ROVING_FOCUS: {
        activeItemTabIndex: 0,
        inactiveItemTabIndex: -1,
      },
      FORM_INTEGRATION: {
        hiddenInputType: 'hidden',
      },
    });
  });
});
