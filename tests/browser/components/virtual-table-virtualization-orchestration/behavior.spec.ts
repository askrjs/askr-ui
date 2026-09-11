import { expect, test } from '../../fixtures';

test.describe('virtual table virtualization orchestration', () => {
  test('should build a state snapshot from the host and the visible range', async ({
    render,
    run,
  }) => {
    await render('stateSnapshot');

    const snapshot = await run<Record<string, unknown>>('snapshot');
    const visibleRange = await run<{ isAtTop: boolean; isAtBottom: boolean }>(
      'visibleRange'
    );

    expect(snapshot).toEqual({
      count: 3,
      rowHeight: 20,
      headerHeight: 5,
      scrollTop: 0,
      viewportHeight: 45,
      totalHeight: 65,
      visibleRange,
      isAtTop: visibleRange.isAtTop,
      isAtBottom: visibleRange.isAtBottom,
      selectedRowKey: 'b',
      selectedRowIndex: 1,
    });
  });

  test('should do nothing when the rows reference has not changed', async ({
    render,
    run,
  }) => {
    await render('unchangedRowsReference');

    expect(await run<boolean>('isSameKeys')).toBe(true);
  });

  test('should rebuild keys and clear the placement cache when the rows reference changes', async ({
    render,
    run,
  }) => {
    await render('changedRowsReference');

    const result = await run<{
      keys: string[];
      indexOfC: number;
      rowsRef: string[];
      placementCount: number;
    }>('result');

    expect(result.keys).toEqual(['a', 'b', 'c']);
    expect(result.indexOfC).toBe(2);
    expect(result.rowsRef).toEqual(['a', 'b', 'c']);
    expect(result.placementCount).toBe(0);
  });

  test('should clamp the pending scroll top to the new content bounds', async ({
    render,
    run,
  }) => {
    await render('clampedPendingScrollTop');

    const result = await run<{ isNull: boolean; pendingScrollTop: number }>(
      'result'
    );

    expect(result.isNull).toBe(false);
    expect(result.pendingScrollTop).toBeLessThanOrEqual(10);
  });
});
