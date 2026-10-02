import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../../fixtures';

/** Port of the old `getToggleByText` helper: an exact, trimmed text match. */
function toggle(root: Locator, text: string): Locator {
  return root
    .locator('[data-slot="toggle-group-item"]')
    .filter({ hasText: new RegExp(`^\\s*${text}\\s*$`, 'u') });
}

/**
 * Waits one animation frame in the page, which drains the microtask flushes an
 * askr update settles in. Needed before asserting that something did *not*
 * change, where an auto-retrying assertion would pass before the update ran.
 */
async function nextFrame(page: Page): Promise<void> {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
  );
}

test.describe('ToggleGroup - Behavior', () => {
  test('should mount single and multiple toggle groups without render-time state errors', async ({
    render,
    root,
    run,
  }) => {
    await render('mountSingleAndMultiple');

    expect(await run<string | null>('thrown')).toBeNull();
    await expect(root.locator('[data-slot="toggle-group"]')).toHaveCount(2);
  });

  test('should render the group container and pressed hooks for single selection', async ({
    render,
    root,
  }) => {
    await render('singleSelectionHooks');
    const group = root.locator('[data-slot="toggle-group"]');
    const left = toggle(root, 'Left');
    const right = toggle(root, 'Right');

    // TOGGLE_GROUP_A11Y_CONTRACT.GROUP_ROLE
    await expect(group).toHaveAttribute('role', 'group');
    await expect(group).toHaveAttribute('data-orientation', 'vertical');
    await expect(group).toHaveAttribute('data-toggle-group', 'true');
    await expect(left).toHaveAttribute('aria-pressed', 'true');
    await expect(left).toHaveAttribute('data-state', 'on');
    await expect(right).toHaveAttribute('aria-pressed', 'false');
    await expect(right).toHaveAttribute('data-state', 'off');
  });

  test('should update uncontrolled single selection and allow collapsing the active item', async ({
    render,
    root,
  }) => {
    await render('uncontrolledSingle');
    const left = toggle(root, 'Left');
    const right = toggle(root, 'Right');

    await right.click();

    await expect(left).toHaveAttribute('aria-pressed', 'false');
    await expect(right).toHaveAttribute('aria-pressed', 'true');

    await right.click();

    await expect(left).toHaveAttribute('aria-pressed', 'false');
    await expect(right).toHaveAttribute('aria-pressed', 'false');
  });

  test('should update uncontrolled multiple selection independently', async ({
    render,
    root,
  }) => {
    await render('uncontrolledMultiple');
    const left = toggle(root, 'Left');
    const right = toggle(root, 'Right');

    await right.click();

    await expect(left).toHaveAttribute('aria-pressed', 'true');
    await expect(right).toHaveAttribute('aria-pressed', 'true');

    await left.click();

    await expect(left).toHaveAttribute('aria-pressed', 'false');
    await expect(right).toHaveAttribute('aria-pressed', 'true');
  });

  test('should support nested toggle items without relying on direct child injection', async ({
    render,
    root,
  }) => {
    await render('nestedItems');

    await toggle(root, 'Right').click();

    await expect(toggle(root, 'Left')).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle(root, 'Right')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should support toggle items produced by a computed array', async ({
    render,
    root,
  }) => {
    await render('computedArrayItems');

    await expect(toggle(root, 'All')).toHaveAttribute('aria-pressed', 'true');

    await toggle(root, 'Midge').click();

    await expect(toggle(root, 'Midge')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should support toggle items produced by For', async ({
    render,
    root,
  }) => {
    await render('forItems');

    await expect(toggle(root, 'All')).toHaveAttribute('aria-pressed', 'true');

    await toggle(root, 'Midge').click();

    await expect(toggle(root, 'Midge')).toHaveAttribute('aria-pressed', 'true');
  });

  test('should reject computed toggle items outside ToggleGroup', async ({
    render,
    run,
  }) => {
    await render('itemsOutsideGroup');

    expect(await run<string | null>('thrown')).toContain(
      'ToggleGroup components must be used within <ToggleGroup>'
    );
  });

  test('should emit normalized values for single and multiple groups', async ({
    render,
    root,
    run,
  }) => {
    await render('normalizedValues');

    await toggle(root, 'Single right').click();
    await expect(toggle(root, 'Single right')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await toggle(root, 'Single right').click();
    await expect(toggle(root, 'Single right')).toHaveAttribute(
      'aria-pressed',
      'false'
    );

    await toggle(root, 'Multiple right').click();
    await expect(toggle(root, 'Multiple right')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await toggle(root, 'Multiple left').click();
    await expect(toggle(root, 'Multiple left')).toHaveAttribute(
      'aria-pressed',
      'false'
    );

    expect(await run<string[][]>('singleCalls')).toEqual([['right'], ['']]);
    expect(await run<string[][][]>('multipleCalls')).toEqual([
      [['left', 'right']],
      [['right']],
    ]);
  });

  test('should block interaction when the group or item is disabled', async ({
    render,
    root,
    run,
  }) => {
    await render('disabledInteraction');

    await expect(toggle(root, 'Group right')).toBeDisabled();
    await expect(toggle(root, 'Item left')).toBeDisabled();
    expect(await run('disabledFlags')).toEqual({
      groupRight: true,
      itemLeft: true,
    });

    await run('clickDisabled');

    expect(await run('changeCounts')).toEqual({ group: 0, item: 0 });
    await expect(toggle(root, 'Item right')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  test('should support asChild item composition and merge host props', async ({
    render,
    root,
  }) => {
    await render('asChildComposition');
    const host = toggle(root, 'Left');

    // TOGGLE_GROUP_A11Y_CONTRACT.ITEM_ROLE
    await expect(host).toHaveAttribute('role', 'button');
    await expect(host).toHaveAttribute('data-testid', 'toggle-item');
    await expect(host).toHaveAttribute('data-from-toggle', 'yes');
    await expect(host).toHaveAttribute('data-from-child', 'yes');
    await expect(host).toHaveAttribute('aria-pressed', 'true');
    await expect(host).toHaveAttribute('data-state', 'on');
  });

  test('should toggle an asChild item with Enter and Space', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('asChildKeyboardToggle');
    const item = toggle(root, 'Left');

    await run('focusFresh', 'Left');
    await page.keyboard.press('Enter');

    await expect(item).toHaveAttribute('aria-pressed', 'true');

    await run('focusFresh', 'Left');
    await page.keyboard.press(' ');

    await expect(item).toHaveAttribute('aria-pressed', 'false');
  });

  test('should forward refs to the group container and item hosts', async ({
    render,
    run,
  }) => {
    await render('refForwarding');

    expect(await run('refs')).toEqual({
      groupMatches: true,
      nativeMatches: true,
      childMatches: true,
    });
  });

  test('should treat value as controlled state when provided', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('controlledValue');
    const group = root.locator('[data-slot="toggle-group"]');

    await expect(group).toHaveCount(1);
    await expect(group).not.toHaveAttribute('value');
    await toggle(root, 'Right').click();
    await nextFrame(page);

    expect(await run<string[][]>('changeCalls')).toContainEqual(['right']);
    await expect(toggle(root, 'Left')).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle(root, 'Right')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  test('should not wrap roving focus at boundaries when loop is false', async ({
    page,
    render,
    root,
  }) => {
    await render('noLoopAtBoundary');
    const left = toggle(root, 'Left');

    await left.focus();
    await page.keyboard.press('ArrowLeft');
    await nextFrame(page);

    await expect(left).toBeFocused();
  });

  test('should not activate disabled items during roving keyboard navigation attempts', async ({
    page,
    render,
    root,
  }) => {
    await render('disabledRovingNavigation');

    await toggle(root, 'Left').focus();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await nextFrame(page);

    await expect(toggle(root, 'Left')).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle(root, 'Right')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    await expect(toggle(root, 'Middle')).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  test('should move focus when the focused item becomes disabled', async ({
    render,
    root,
    run,
  }) => {
    await render('focusedItemBecomesDisabled');
    await expect(toggle(root, 'Middle')).toBeFocused();

    await run('disableMiddle');

    await expect(toggle(root, 'Right')).toBeFocused();
  });

  test('should move the roving tab stop with a controlled value change', async ({
    render,
    root,
    run,
  }) => {
    await render('controlledTabStop');

    await run('selectRight');

    const items = root.locator('[data-slot="toggle-group-item"]');
    await expect(items.nth(0)).toHaveAttribute('tabindex', '-1');
    await expect(items.nth(1)).toHaveAttribute('tabindex', '0');
    await expect(items.nth(1)).toHaveAttribute('aria-pressed', 'true');
  });

  test('should reverse horizontal arrow navigation under dir="rtl"', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('rtlArrowNavigation');

    await run('focusToggle', 'Middle');
    await page.keyboard.press('ArrowRight');
    await expect(toggle(root, 'Left')).toBeFocused();

    await page.keyboard.press('ArrowLeft');
    await expect(toggle(root, 'Middle')).toBeFocused();

    await page.keyboard.press('ArrowLeft');
    await expect(toggle(root, 'Right')).toBeFocused();
  });

  test('should keep advancing the roving tab stop across repeated arrow presses', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('repeatedArrowPresses');

    await run('focusToggle', 'Left');
    await page.keyboard.press('ArrowRight');
    await expect(toggle(root, 'Middle')).toBeFocused();
    await expect.poll(() => run('tabStopText')).toBe('Middle');

    await page.keyboard.press('ArrowRight');
    await expect(toggle(root, 'Right')).toBeFocused();
    await expect.poll(() => run('tabStopText')).toBe('Right');

    await page.keyboard.press('ArrowLeft');
    await expect(toggle(root, 'Middle')).toBeFocused();
    await expect.poll(() => run('tabStopText')).toBe('Middle');

    // Navigation alone never changes the selected value.
    await expect(toggle(root, 'Left')).toHaveAttribute('aria-pressed', 'true');
  });
});
