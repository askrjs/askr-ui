import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { expect, test } from '../../fixtures';

test.describe('Input - Determinism', () => {
  test('should render deterministic native input markup', async ({
    render,
    run,
  }) => {
    await render('nativeMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should render deterministic asChild and debounced input markup', async ({
    render,
    run,
  }) => {
    await render('asChildAndDebouncedMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should not schedule timers during debounced input render', async ({
    render,
    run,
  }) => {
    await render('timersDuringRender');

    expect(
      await run<{ timeouts: number; intervals: number }>('scheduled')
    ).toEqual({ timeouts: 0, intervals: 0 });
  });
});
