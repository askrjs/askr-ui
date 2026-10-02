import { expect, test } from '../../fixtures';

test.describe('dynamic style rules', () => {
  test('should retain every mounted rule when the bounded cache is full', async ({
    render,
    run,
  }) => {
    await render('boundedCacheFull');

    const rules = await run<string | null>('run');

    expect(rules).toContain('[data-active-rule="0"]');
    expect(rules).toContain('[data-active-rule="512"]');
  });

  test('should keep rules during ref swaps and remove them after unmount', async ({
    render,
    run,
  }) => {
    await render('refSwapThenUnmount');

    const observed = await run<{
      afterSet: string;
      afterRefSwap: string;
      rulesAfterUnmount: string;
    }>('run');

    expect(observed.afterSet).toBe('42%');
    expect(observed.afterRefSwap).toBe('42%');
    expect(observed.rulesAfterUnmount).not.toContain('--test-dynamic-value');
  });

  test('should reject selector and declaration breakout input', async ({
    render,
    run,
  }) => {
    await render('breakoutInput');

    const observed = await run<{
      invalidAttributeError: string | null;
      selector: string;
      unsafeValueError: string | null;
    }>('run');

    expect(observed.invalidAttributeError).toContain(
      'Invalid dynamic style attribute'
    );
    expect(observed.selector).toContain('\\"');
    expect(observed.unsafeValueError).toContain('Unsafe dynamic CSS value');
  });

  test('should isolate registries by nonce and remove empty registry elements', async ({
    render,
    run,
  }) => {
    await render('nonceRegistries');

    const observed = await run<{
      hasFirst: boolean;
      hasSecond: boolean;
      firstRules: string | null;
      remaining: number;
    }>('run');

    expect(observed.hasFirst).toBe(true);
    expect(observed.hasSecond).toBe(true);
    expect(observed.firstRules).not.toContain('.nonce-second');
    expect(observed.remaining).toBe(0);
  });
});
