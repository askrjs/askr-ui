import type { Locator } from '@playwright/test';

import { expect, test } from '../../fixtures';

async function box(locator: Locator) {
  const rect = await locator.boundingBox();
  if (!rect) throw new Error('element has no layout box');
  return rect;
}

test.describe('VirtualList - Behavior', () => {
  test('should release generated layout rules after unmount', async ({
    render,
    run,
  }) => {
    await render('layoutRulesRelease');

    expect(await run<string>('dynamicStyles')).toContain(
      'data-askr-virtual-list-row-height="37"'
    );
    expect(await run<boolean>('hasNoncedRowHeightRule')).toBe(true);

    await run('unmount');

    expect(await run<string>('dynamicStyles')).not.toContain(
      'data-askr-virtual-list-row-height="37"'
    );
  });

  test('should render a virtual window, scroll by index, and follow the bottom', async ({
    render,
    root,
    run,
  }) => {
    await render('windowScrollAndFollow');

    await expect(root.locator('[data-slot="virtual-list"]')).toHaveAttribute(
      'role',
      'list'
    );
    await expect(root.locator('[data-slot="virtual-list-row"]')).toHaveCount(3);
    await expect(root.locator('[data-key="item-0"]')).toHaveCount(1);
    await expect(root.locator('[data-key="item-2"]')).toHaveCount(1);
    expect(await run<number>('visibleStartIndex')).toBe(0);

    await run('scrollToIndex', 4);

    expect(await run<number>('visibleStartIndex')).toBe(4);
    await expect(root.locator('[data-key="item-4"]')).toHaveAttribute(
      'data-visible',
      'true'
    );

    await run('scrollToBottom');

    expect(await run<boolean>('isFollowingBottom')).toBe(true);
    expect(await run<number>('scrollTop')).toBe(100);

    await run('appendItem');

    expect(await run<boolean>('isFollowingBottom')).toBe(true);
    expect(await run<number>('pendingUnseenCount')).toBe(0);
    // The native scroll extent grows after the appended row is committed.
    // Firefox can deliver that layout and scroll update after the scenario's
    // update flush, so wait for the browser-backed API state to settle.
    await expect.poll(() => run<number>('scrollTop')).toBe(120);
    await expect(root.locator('[data-key="item-8"]')).toHaveCount(1);
  });

  test('should map typed viewport affordance to a stable data attribute', async ({
    render,
    root,
  }) => {
    await render('viewportAffordance');

    await expect(root.locator('[data-slot="virtual-list"]')).toHaveAttribute(
      'data-viewport',
      'lg'
    );
  });

  test('should support asChild composition with semantic list items', async ({
    render,
    root,
  }) => {
    await render('asChildList');
    const host = root.locator('ul');
    const firstRow = root.locator('li').first();

    await expect(host).toHaveAttribute('data-slot', 'virtual-list');
    await expect(host).not.toHaveAttribute('role');
    await expect(firstRow).toHaveAttribute('data-slot', 'virtual-list-row');
    await expect(firstRow).not.toHaveAttribute('role');
  });

  test('should forward user scroll handlers from the virtual viewport', async ({
    render,
    run,
  }) => {
    await render('forwardedScrollHandler');

    expect(await run<number>('scrollCount')).toBe(0);

    await run('scrollTo', 40);

    await expect.poll(() => run<number>('scrollCount')).toBe(1);
    // One scroll gesture is forwarded once, not once per re-render.
    await run('nextFrame');
    expect(await run<number>('scrollCount')).toBe(1);
  });

  test('should reserve the full native scroll extent and advance from browser scrolling', async ({
    render,
    root,
    run,
  }) => {
    await render('nativeScrollExtent');
    const host = root.locator('[data-slot="virtual-list"]');

    expect(await host.evaluate((node) => node.scrollHeight)).toBe(200_000);

    await run('scrollTo', 20_000);

    await expect
      .poll(() => host.evaluate((node) => node.scrollTop))
      .toBeCloseTo(20_000, 0);
    await expect.poll(() => run<number>('visibleStartIndex')).toBe(1_000);
  });

  test('should clamp a pending scroll commit when its dataset is replaced', async ({
    render,
    run,
  }) => {
    await render('clampPendingScrollCommit');

    const { afterFlush, afterFrame } = await run<{
      afterFlush: number;
      afterFrame: number;
    }>('scrollThenReplace');

    const maximumScrollTop = 20 * 20 - 100;
    expect(afterFlush).toBeLessThanOrEqual(maximumScrollTop);
    expect(afterFrame).toBeLessThanOrEqual(maximumScrollTop);
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
    root,
  }) => {
    await render('fixedRowHeightContainment');
    const rows = root.locator('[data-slot="virtual-list-row"]');

    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toHaveCSS('overflow-y', 'hidden');
    const firstBox = await box(rows.nth(0));
    const secondBox = await box(rows.nth(1));

    expect(firstBox.height).toBeCloseTo(20, 0);
    expect(secondBox.y - firstBox.y).toBeCloseTo(20, 0);
  });

  test('should reposition keyed rows when an opt-in row height expands', async ({
    render,
    root,
  }) => {
    await render('expandableRowHeight');
    const host = root.locator('[data-slot="virtual-list"]');
    const scrollHeight = () => host.evaluate((node) => node.scrollHeight);

    expect(await scrollHeight()).toBe(80);

    await root.locator('[data-key="item-0"] button').click();
    const inspect = root.getByRole('button', { name: 'Inspect Item 0' });
    await inspect.focus();

    const first = root.locator('[data-key="item-0"]');
    const second = root.locator('[data-key="item-1"]');
    await expect.poll(async () => (await box(first)).height).toBeCloseTo(80, 0);
    const firstBox = await box(first);
    const secondBox = await box(second);
    expect(secondBox.y - firstBox.y).toBeCloseTo(80, 0);
    expect(await scrollHeight()).toBe(140);
    await expect(inspect).toBeFocused();
  });
});
