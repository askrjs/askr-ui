import { expect, test } from '../../fixtures';

test.describe('virtual table style injection', () => {
  test('should return no attribute and inject no rule when the value is undefined', async ({
    render,
    run,
  }) => {
    await render('undefinedValue');

    const result = await run<{
      props: Record<string, string>;
      nextRuleCount: number;
    }>('result');

    expect(result.props).toEqual({});
    expect(result.nextRuleCount).toBe(0);
  });

  test('should inject a dynamic style rule and return the matching data attribute', async ({
    render,
    run,
  }) => {
    await render('injectedRule');

    const result = await run<{
      props: Record<string, string>;
      nextRuleCount: number;
    }>('result');

    expect(result.props).toEqual({
      'data-askr-virtual-table-row-height': '32',
    });
    expect(result.nextRuleCount).toBe(1);

    expect(await run<string>('committedHeight')).toBe('32px');
  });

  test('should remove rules that are no longer used after committing', async ({
    render,
    run,
  }) => {
    await render('unusedRuleRemoval');

    const result = await run<{
      afterFirstCommit: number;
      afterSecondCommit: number;
    }>('result');

    expect(result.afterFirstCommit).toBe(1);
    expect(result.afterSecondCommit).toBe(0);
  });

  test('should clear every committed rule immediately on unmount cleanup', async ({
    render,
    run,
  }) => {
    await render('unmountCleanup');

    const result = await run<{ afterCommit: number; afterClear: number }>(
      'result'
    );

    expect(result.afterCommit).toBe(1);
    expect(result.afterClear).toBe(0);
  });
});
