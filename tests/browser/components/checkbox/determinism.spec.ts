import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { expect, test } from '../../fixtures';

test.describe('Checkbox - Determinism', () => {
  test('should render deterministic native checkbox markup', async ({
    render,
    run,
  }) => {
    await render('nativeMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should render deterministic indeterminate and asChild checkbox markup', async ({
    render,
    run,
  }) => {
    await render('indeterminateAndAsChildMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should preserve checkbox state signaling across remounts', async ({
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
