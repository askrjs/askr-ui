import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { expect, test } from '../../fixtures';

test.describe('Toggle - Determinism', () => {
  test('should render deterministic native toggle markup', async ({
    render,
    run,
  }) => {
    await render('nativeMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should render deterministic asChild toggle markup', async ({
    render,
    run,
  }) => {
    await render('asChildMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should keep pressed state props-driven across remounts', async ({
    render,
    run,
  }) => {
    await render('pressedAcrossRemounts');

    expect(
      await run<{ first: string; second: string }>('pressedStates')
    ).toEqual({ first: 'false', second: 'true' });
  });

  test('should not schedule timers during render', async ({ render, run }) => {
    await render('timersDuringRender');

    expect(
      await run<{ timeouts: number; intervals: number }>('scheduled')
    ).toEqual({ timeouts: 0, intervals: 0 });
  });
});
