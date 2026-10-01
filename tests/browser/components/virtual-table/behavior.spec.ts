import type { Page } from '@playwright/test';

import { expect, test } from '../../fixtures';

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

test.describe('VirtualTable - Behavior', () => {
  test('should release generated layout rules after unmount', async ({
    render,
    run,
  }) => {
    await render('layoutRuleRelease');

    const mounted = await run<{
      styles: string;
      headerCellHeight: number;
      hasNoncedRule: boolean;
    }>('mounted');
    expect(mounted.styles).toContain('data-askr-virtual-table-row-height="43"');
    expect(mounted.styles).toContain(
      'data-askr-virtual-table-header-height="43"'
    );
    expect(mounted.styles).toContain(
      'data-askr-virtual-table-column-width="173px"'
    );
    expect(mounted.headerCellHeight).toBe(43);
    expect(mounted.hasNoncedRule).toBe(true);

    const { styles } = await run<{ styles: string }>('unmounted');
    expect(styles).not.toContain('data-askr-virtual-table-row-height="43"');
    expect(styles).not.toContain('data-askr-virtual-table-header-height="43"');
    expect(styles).not.toContain(
      'data-askr-virtual-table-column-width="173px"'
    );
  });

  test('should render a sticky-headed virtual table and support keyboard selection', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('stickyHeaderSelection');
    const table = root.locator('[data-slot="virtual-table-table"]');
    const wrapper = root.locator('[data-slot="virtual-table"]');
    const firstRow = root.locator('[data-row-key="row-0"]');
    const rows = root.locator('[data-slot="virtual-table-row"]');

    await expect(table).toHaveAttribute('role', 'grid');
    await expect(table).toHaveAttribute('aria-rowcount', '11');
    await expect(
      root.locator('[data-slot="virtual-table-header-row"]')
    ).toHaveAttribute('aria-rowindex', '1');
    await expect(rows).toHaveCount(4);
    await expect(rows.last()).not.toHaveAttribute('data-terminal-row');
    await expect(firstRow).toHaveAttribute('aria-selected', 'false');
    await expect(firstRow).toHaveAttribute('aria-rowindex', '2');
    await expect(wrapper).toHaveAttribute('data-at-top', 'true');
    await expect(wrapper).toHaveAttribute('data-at-bottom', 'false');
    await expect(wrapper).toHaveAttribute('data-empty', 'false');

    await run('scrollTo', 1);
    await expect(wrapper).toHaveAttribute('data-at-top', 'false');

    await run('scrollTo', 0);
    await expect(wrapper).toHaveAttribute('data-at-top', 'true');

    await firstRow.click();

    await expect(firstRow).toHaveAttribute('aria-selected', 'true');
    expect(await run<number>('rowClickCount')).toBe(1);
    expect(await run<string | null>('selectedRowKey')).toBe('row-0');

    await table.focus();
    await page.keyboard.press('ArrowDown');

    await expect(root.locator('[data-row-key="row-1"]')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(await run<number | null>('selectedRowIndex')).toBe(1);

    await run('scrollToBottom');

    await expect.poll(() => run<boolean | null>('isAtBottom')).toBe(true);
    await expect(root.locator('[data-row-key="row-9"]')).toHaveAttribute(
      'data-terminal-row',
      'true'
    );
    await expect(wrapper).toHaveAttribute('data-at-bottom', 'true');
  });

  test('should preserve nested interactive cell behavior without selecting its row', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('nestedInteractiveCell');
    const action = root.locator('[data-row-key="row-0"] button');

    await action.focus();
    await action.press('Enter');
    await nextFrame(page);

    expect(await run<string[]>('actionArgs')).toContain('row-0');
    expect(await run<string | null>('selectedRowKey')).toBeNull();
    await expect(action).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await nextFrame(page);

    expect(await run<string | null>('selectedRowKey')).toBeNull();
    await expect(action).toBeFocused();
  });

  test('should honor default-prevented nested events before selecting a row', async ({
    render,
    run,
  }) => {
    await render('defaultPreventedNestedEvents');

    // Synthetic events on purpose: the key event must originate from the
    // non-focusable span inside the cell, which a real key press cannot target.
    expect(await run('click')).toEqual({
      defaultPrevented: true,
      selectedRowKey: null,
    });
    expect(await run('arrowDown')).toEqual({
      defaultPrevented: true,
      selectedRowKey: null,
    });
  });

  test('should let a caller prevent the table keyboard behavior', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('callerPreventedKeyboard');

    await root.locator('[data-slot="virtual-table-table"]').focus();
    await page.keyboard.press('ArrowDown');
    await run('flush');

    expect(await run<number>('keyDownCount')).toBe(1);
    expect(await run<boolean | null>('keydownPrevented')).toBe(true);
    expect(await run<string | null>('selectedRowKey')).toBeNull();
  });

  test('should map typed viewport and table width affordances to stable data attributes', async ({
    render,
    root,
  }) => {
    await render('viewportAffordances');
    const table = root.locator('[data-slot="virtual-table"]');

    await expect(table).toHaveAttribute('data-viewport', 'lg');
    await expect(table).toHaveAttribute('data-table-width', 'compact');
  });

  test('should expose the empty scroll-edge state to themes', async ({
    render,
    root,
  }) => {
    await render('emptyScrollEdges');
    const wrapper = root.locator('[data-slot="virtual-table"]');

    await expect(wrapper).toHaveAttribute('data-at-top', 'true');
    await expect(wrapper).toHaveAttribute('data-at-bottom', 'true');
    await expect(wrapper).toHaveAttribute('data-empty', 'true');
  });

  test('should support asChild composition on the wrapper host', async ({
    render,
    root,
  }) => {
    await render('asChildComposition');
    const table = root.locator('table');

    await expect(root.locator('section')).toHaveAttribute(
      'data-slot',
      'virtual-table'
    );
    await expect(table).toHaveAttribute('data-slot', 'virtual-table-table');
    await expect(table.locator('tr')).toHaveCount(5);
  });

  test('should forward user scroll handlers from the virtual wrapper', async ({
    render,
    run,
  }) => {
    await render('forwardedScrollHandler');

    expect(await run<number>('scrollCount')).toBe(0);

    await run('scrollTo', 72);

    await expect.poll(() => run<number>('scrollCount')).toBe(1);
    // One scroll gesture is forwarded once, not once per re-render.
    await run('nextFrame');
    expect(await run<number>('scrollCount')).toBe(1);
    // Firefox can expose a subpixel scroll offset after layout. The public
    // contract is the requested logical position, not engine-specific rounding.
    expect(await run<number>('scrollTop')).toBeCloseTo(72, 0);
  });

  test('should clamp a pending scroll commit when its dataset is replaced', async ({
    render,
    run,
  }) => {
    await render('clampedPendingScrollCommit');
    const maximumScrollTop = 24 + (20 * 24 - (120 - 24));

    const afterReplace = await run<{ rowCount: number; scrollTop: number }>(
      'afterReplace'
    );
    expect(afterReplace.rowCount).toBe(20);
    expect(afterReplace.scrollTop).toBeLessThanOrEqual(maximumScrollTop);

    const afterFrame = await run<{
      scrollTop: number;
      wrapperScrollTop: number;
    }>('afterFrame');
    expect(afterFrame.scrollTop).toBeLessThanOrEqual(maximumScrollTop);
    expect(afterFrame.wrapperScrollTop).toBeLessThanOrEqual(maximumScrollTop);
  });

  test('should report no ResizeObserver loop errors during dynamic resize churn', async ({
    render,
    run,
  }) => {
    await render('resizeChurn');

    expect(await run<string[]>('churn')).toEqual([]);
  });

  test('should contain content within its fixed row-height contract', async ({
    render,
    run,
  }) => {
    await render('fixedRowHeightContract');

    const measured = await run<{
      cellOverflowY: string | null;
      cellContentOverflowY: string | null;
      firstRowHeight: number;
      rowOffset: number;
    }>('measurements');

    expect(measured.cellOverflowY).toBe('hidden');
    expect(measured.cellContentOverflowY).toBe('hidden');
    expect(measured.firstRowHeight).toBeCloseTo(24, 0);
    expect(measured.rowOffset).toBeCloseTo(24, 0);
  });
});

test('VirtualTable selects every valid falsy row by index and key', async ({
  render,
  run,
}) => {
  await render('falsyTableRows');
  for (const index of [5, 0, 1, 2, 3, 4])
    expect(await run('select', index)).toEqual({ key: String(index), index });
  for (const index of [5, 0, 1, 2, 3, 4])
    expect(await run('selectKey', String(index))).toEqual({
      key: String(index),
      index,
    });
  for (const index of [-1, 6, 1.5])
    expect(await run('select', index)).toEqual({ key: '4', index: 4 });
});

test('Virtual components clear replaced object refs', async ({
  render,
  run,
}) => {
  await render('virtualRefReplacement');
  expect(await run('refs')).toEqual({
    oldListNode: true,
    newListNode: false,
    oldListApi: true,
    newListApi: false,
    oldTableNode: true,
    newTableNode: false,
    oldTableApi: true,
    newTableApi: false,
  });
  await run('change');
  expect(await run('refs')).toEqual({
    oldListNode: false,
    newListNode: true,
    oldListApi: false,
    newListApi: true,
    oldTableNode: false,
    newTableNode: true,
    oldTableApi: false,
    newTableApi: true,
  });
  await run('unmount');
  expect(await run('refs')).toEqual({
    oldListNode: false,
    newListNode: false,
    oldListApi: false,
    newListApi: false,
    oldTableNode: false,
    newTableNode: false,
    oldTableApi: false,
    newTableApi: false,
  });
});

test('Virtual components retain an empty-string anchor key when rows are prepended', async ({
  render,
  run,
}) => {
  await render('emptyKeyAnchoring');
  await run('scrollToAnchor');
  await expect.poll(() => run('scrollTops')).toEqual({ list: 56, table: 56 });
  await run('prepend');
  await expect.poll(() => run('scrollTops')).toEqual({ list: 112, table: 112 });
});

test('VirtualTable uses changed getKey callback with the same rows array', async ({
  render,
  run,
  root,
}) => {
  await render('changedKeyResolver');
  await run('rekey');
  await expect(root.locator('[data-row-key="new-c"]')).toHaveCount(1);
  expect(await run('select')).toEqual({ key: 'new-c', index: 2 });
});
test('Virtual components anchor newly rendered keys after getKey changes', async ({
  render,
  run,
}) => {
  await render('changedKeyResolver');
  await run('scroll');
  await expect.poll(() => run('scrollTops')).toEqual({ list: 56, table: 56 });
  await run('rekey');
  await run('prepend');
  await expect.poll(() => run('scrollTops')).toEqual({ list: 84, table: 84 });
});

test('VirtualTable honors ancestor keyboard cancellation', async ({
  page,
  render,
  root,
  run,
}) => {
  await render('stickyHeaderSelection');
  await page.evaluate(() =>
    document.addEventListener('keydown', (event) => event.preventDefault(), {
      capture: true,
    })
  );
  const table = root.locator('[data-slot="virtual-table-table"]');
  await table.focus();
  await table.press('ArrowDown');
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
  );
  expect(await run<string | null>('selectedRowKey')).toBeNull();
  await expect(table).toBeFocused();
});

for (const phase of ['render', 'structural'] as const) {
  test(`Virtual keys stay committed after discarded ${phase} resolver`, async ({
    render,
    root,
    run,
  }) => {
    await render('discardedKeyResolver');
    await run('scroll');
    await expect.poll(() => run('scrollTops')).toEqual({ list: 56, table: 56 });
    expect(await run('selected')).toEqual({ key: 'old-c', index: 2 });
    expect(await run('reject', phase)).toBe('discarded key resolver');
    await expect(
      root.locator('[data-slot="virtual-table-row"][data-row-key="old-c"]')
    ).toHaveCount(1);
    expect(await run('selected')).toEqual({ key: 'old-c', index: 2 });
    await run('prepend');
    await expect.poll(() => run('scrollTops')).toEqual({ list: 84, table: 84 });
    expect(await run('counts')).toEqual({
      listNode: 1,
      listNodeNull: 0,
      listApi: 1,
      listApiNull: 0,
      tableNode: 1,
      tableNodeNull: 0,
      tableApi: 1,
      tableApiNull: 0,
    });
    await run('unmount');
    expect(await run('counts')).toEqual({
      listNode: 1,
      listNodeNull: 1,
      listApi: 1,
      listApiNull: 1,
      tableNode: 1,
      tableNodeNull: 1,
      tableApi: 1,
      tableApiNull: 1,
    });
  });
}

for (const phase of ['render', 'structural'] as const) {
  test(`Virtual components retain committed geometry after rejected ${phase} properties`, async ({
    render,
    run,
  }) => {
    await render('rejectedVirtualProperties');
    expect(await run('geometry')).toEqual({ list: 112, table: 140 });
    expect(await run('reject', phase)).toBe('discarded virtual properties');
    expect(await run('geometry')).toEqual({ list: 112, table: 140 });
  });
  test(`Virtual components retain native scroll callbacks after rejected ${phase} properties`, async ({
    render,
    run,
  }) => {
    await render('rejectedVirtualProperties');
    expect(await run('reject', phase)).toBe('discarded virtual properties');
    expect(await run('scrollCallbacks')).toEqual([
      'old-list-scroll',
      'old-table-scroll',
    ]);
  });
  test(`VirtualTable retains selection callback after rejected ${phase} properties`, async ({
    render,
    run,
  }) => {
    await render('rejectedVirtualProperties');
    expect(await run('reject', phase)).toBe('discarded virtual properties');
    expect(await run('selectCallback')).toEqual(['old-selection']);
  });
}
