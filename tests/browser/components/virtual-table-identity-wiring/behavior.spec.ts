import { expect, test } from '../../fixtures';

test.describe('virtual table identity wiring', () => {
  test('should derive a scope identity from the parent identity, row key, and column', async ({
    render,
    run,
  }) => {
    await render('derivedScope');

    expect(await run<Record<string, unknown>>('scope')).toEqual({
      identity: JSON.stringify([
        'parent-identity',
        'table-cell',
        'row-1',
        'name',
      ]),
      index: 0,
      setSize: 2,
      placementEnabled: true,
    });
  });

  test('should return the cached scope object when nothing relevant has changed', async ({
    render,
    run,
  }) => {
    await render('cachedScope');

    expect(await run<boolean>('isSameScope')).toBe(true);
  });

  test('should recompute the scope when the index, set size, or placement flag changes', async ({
    render,
    run,
  }) => {
    await render('recomputedScope');

    const result = await run<{ isSameScope: boolean; index: number }>('result');

    expect(result.isSameScope).toBe(false);
    expect(result.index).toBe(1);
  });
});
