import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { expect, test } from '../../fixtures';

test.describe('Button - Determinism', () => {
  test('should render deterministic native button markup', async ({
    render,
    run,
  }) => {
    await render('nativeMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should map typed size and width affordances to stable data attributes', async ({
    render,
    root,
  }) => {
    await render('sizeAndWidthAttributes');
    const button = root.locator('[data-slot="button"]');

    await expect(button).toHaveAttribute('data-size', 'icon-xs');
    await expect(button).toHaveAttribute('data-width', 'full');
  });

  test('should render deterministic asChild markup', async ({
    render,
    run,
  }) => {
    await render('asChildMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should keep behavior props-driven across remounts', async ({
    render,
    run,
  }) => {
    await render('behaviorAcrossRemounts');

    expect(await run<{ first: number; second: number }>('pressCounts')).toEqual(
      { first: 1, second: 1 }
    );
  });

  test('should not schedule timers during render', async ({ render, run }) => {
    await render('timersDuringRender');

    expect(
      await run<{ timeouts: number; intervals: number }>('scheduled')
    ).toEqual({ timeouts: 0, intervals: 0 });
  });
});
