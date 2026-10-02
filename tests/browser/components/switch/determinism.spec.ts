import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { expect, test } from '../../fixtures';

test.describe('Switch - Determinism', () => {
  test('should render deterministic native switch markup', async ({
    render,
    run,
  }) => {
    await render('nativeMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should render deterministic asChild switch markup', async ({
    render,
    run,
  }) => {
    await render('asChildMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should keep checked state props-driven across remounts', async ({
    render,
    run,
  }) => {
    await render('checkedAcrossRemounts');

    expect(
      await run<{ first: string; second: string }>('checkedStates')
    ).toEqual({ first: 'false', second: 'true' });
  });

  test('should not schedule timers during render', async ({ render, run }) => {
    await render('timersDuringRender');

    expect(
      await run<{ timeouts: number; intervals: number }>('scheduled')
    ).toEqual({ timeouts: 0, intervals: 0 });
  });
});
