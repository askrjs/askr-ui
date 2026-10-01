import { type Locator, expect, test } from '../../fixtures';

/** The radio item whose trimmed text is exactly `text`. */
function radio(root: Locator, text: string): Locator {
  return root
    .locator('[data-slot="radio-group-item"]')
    .filter({ hasText: new RegExp(`^\\s*${text}\\s*$`, 'u') });
}

/** A programmatic `.click()`, which Playwright's actionability wait skips. */
async function domClick(locator: Locator): Promise<void> {
  await locator.evaluate((node: HTMLElement) => node.click());
}

test.describe('RadioGroup - Behavior', () => {
  test('should render the radiogroup container and checked hooks in uncontrolled mode', async ({
    render,
    root,
    run,
  }) => {
    await render('uncontrolledHooks');
    const contract = await run<{ GROUP_ROLE: string; ITEM_ROLE: string }>(
      'contract'
    );
    const group = root.locator('[data-slot="radio-group"]');
    const small = radio(root, 'Small');
    const medium = radio(root, 'Medium');

    await expect(group).toHaveAttribute('role', contract.GROUP_ROLE);
    await expect(group).toHaveAttribute('data-orientation', 'horizontal');
    await expect(group).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(small).toHaveAttribute('role', contract.ITEM_ROLE);
    await expect(small).toHaveAttribute('aria-checked', 'false');
    await expect(small).toHaveAttribute('data-state', 'unchecked');
    await expect(medium).toHaveAttribute('aria-checked', 'true');
    await expect(medium).toHaveAttribute('data-state', 'checked');
  });

  test('should update uncontrolled selection and hidden input value', async ({
    render,
    root,
  }) => {
    await render('uncontrolledNamed');

    await radio(root, 'Medium').click();

    await expect(radio(root, 'Small')).toHaveAttribute('aria-checked', 'false');
    await expect(radio(root, 'Medium')).toHaveAttribute('aria-checked', 'true');
    await expect(root.locator('input[type="hidden"]')).toHaveAttribute(
      'value',
      'medium'
    );
  });

  test('should support nested radio items without relying on direct child cloning', async ({
    render,
    root,
    run,
  }) => {
    await render('nestedItems');
    expect(await run<number>('itemCount')).toBe(2);

    await radio(root, 'Medium').click();

    expect(await run<string[]>('changes')).toEqual(['medium']);
    expect(await run<number>('itemCount')).toBe(2);
    await expect(radio(root, 'Small')).toHaveAttribute('aria-checked', 'false');
    await expect(radio(root, 'Medium')).toHaveAttribute('aria-checked', 'true');
    await expect(root.locator('input[type="hidden"]')).toHaveAttribute(
      'value',
      'medium'
    );
  });

  test('should treat value as controlled state when provided', async ({
    render,
    root,
    run,
  }) => {
    await render('controlled');

    await radio(root, 'Medium').click();

    expect(await run<string[][]>('calls')).toContainEqual(['medium']);
    await expect(radio(root, 'Small')).toHaveAttribute('aria-checked', 'true');
    await expect(radio(root, 'Medium')).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  test('should block interaction when the group or item is disabled', async ({
    render,
    root,
    run,
  }) => {
    await render('disabledGroupAndItem');
    const groupMedium = radio(root, 'Group medium');
    const itemSmall = radio(root, 'Item small');

    await expect(groupMedium).toBeDisabled();
    await expect(itemSmall).toBeDisabled();

    await domClick(groupMedium);
    await domClick(itemSmall);

    expect(await run('groupCalls')).toEqual([]);
    expect(await run('itemCalls')).toEqual([]);
    await expect(radio(root, 'Item medium')).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  test('should support asChild item composition and merge host props', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildComposition');
    const contract = await run<{ ITEM_ROLE: string }>('contract');
    const host = radio(root, 'Left');

    await expect(host).toHaveAttribute('role', contract.ITEM_ROLE);
    await expect(host).toHaveAttribute('data-testid', 'radio-item');
    await expect(host).toHaveAttribute('data-from-radio', 'yes');
    await expect(host).toHaveAttribute('data-from-child', 'yes');
    await expect(host).toHaveAttribute('aria-checked', 'true');
    await expect(host).toHaveAttribute('data-state', 'checked');
  });

  test('should ignore Enter and activate native and asChild items with Space', async ({
    render,
    root,
  }) => {
    await render('keyboardActivation');
    const small = radio(root, 'Small');
    const medium = radio(root, 'Medium');

    await medium.press('Enter');
    await expect(medium).toHaveAttribute('aria-checked', 'false');

    await medium.press('Space');
    await expect(medium).toHaveAttribute('aria-checked', 'true');

    await small.press('Enter');
    await expect(small).toHaveAttribute('aria-checked', 'false');
    await expect(medium).toHaveAttribute('aria-checked', 'true');
  });

  test('should restore its uncontrolled value when its native form resets', async ({
    render,
    root,
    run,
  }) => {
    await render('formReset');

    await radio(root, 'Medium').click();
    await expect(radio(root, 'Medium')).toHaveAttribute('aria-checked', 'true');

    await run('reset');

    await expect(radio(root, 'Small')).toHaveAttribute('aria-checked', 'true');
    expect(await run('calls')).toEqual([['medium'], ['small']]);
  });

  test('should forward refs to the group container and item hosts', async ({
    render,
    run,
  }) => {
    await render('forwardedRefs');

    expect(await run('refs')).toEqual({
      groupMatches: true,
      nativeItemMatches: true,
      childItemMatches: true,
    });
  });

  test('should render a hidden input only when name is provided', async ({
    render,
    root,
  }) => {
    await render('namedAndUnnamed');
    const inputs = root.locator('input[type="hidden"]');

    await expect(inputs).toHaveCount(1);
    await expect(inputs).toHaveAttribute('name', 'named-size');
    await expect(inputs).toHaveAttribute('value', 'medium');
  });

  test('should not wrap selection at boundaries when loop is false', async ({
    render,
    root,
  }) => {
    await render('noLoop');

    await radio(root, 'Small').press('ArrowLeft');

    await expect(radio(root, 'Small')).toHaveAttribute('aria-checked', 'true');
    await expect(radio(root, 'Medium')).toHaveAttribute(
      'aria-checked',
      'false'
    );
  });

  test('should skip disabled items during keyboard navigation', async ({
    render,
    root,
  }) => {
    await render('disabledMiddle');
    const small = radio(root, 'Small');

    await small.press('ArrowDown');
    await small.press('ArrowRight');

    await expect(radio(root, 'Small')).toHaveAttribute('aria-checked', 'false');
    await expect(radio(root, 'Medium')).toHaveAttribute(
      'aria-checked',
      'false'
    );
    await expect(radio(root, 'Large')).toHaveAttribute('aria-checked', 'true');
  });

  test('should isolate generated ids and roving focus between identical sibling groups', async ({
    render,
    root,
    run,
  }) => {
    await render('siblingGroups');
    const groups = root.locator('[data-slot="radio-group"]');
    const firstItems = groups.nth(0).locator('[data-slot="radio-group-item"]');
    const secondItems = groups.nth(1).locator('[data-slot="radio-group-item"]');

    const ids = await run<{ first: string[]; second: string[] }>('ids');
    expect(ids.first).not.toEqual(ids.second);

    await firstItems.nth(0).press('ArrowDown');

    await expect(firstItems.nth(1)).toBeFocused();
    await expect(firstItems.nth(1)).toHaveAttribute('aria-checked', 'true');
    await expect(secondItems.nth(0)).toHaveAttribute('aria-checked', 'true');
  });

  test('should repair focus when the focused item becomes disabled', async ({
    render,
    root,
    run,
  }) => {
    await render('focusRepair');
    await radio(root, 'Medium').focus();

    await run('disable');

    await expect(radio(root, 'Large')).toBeFocused();
    await expect(radio(root, 'Medium')).toHaveAttribute('tabindex', '-1');
  });

  test('should leave no disabled item focused when every item becomes disabled', async ({
    render,
    root,
    run,
  }) => {
    await render('allDisabled');
    const only = radio(root, 'Only');
    await only.focus();

    await run('disable');

    await expect(only).not.toBeFocused();
    expect(await run<boolean>('activeIsDisabled')).toBe(false);
  });

  test('should reverse horizontal arrow navigation under dir="rtl"', async ({
    page,
    render,
    root,
  }) => {
    await render('rtl');

    await radio(root, 'Middle').focus();
    await page.keyboard.press('ArrowRight');
    await expect(radio(root, 'Left')).toBeFocused();

    await page.keyboard.press('ArrowLeft');
    await expect(radio(root, 'Middle')).toBeFocused();
  });
});
