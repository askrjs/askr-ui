import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { expect, test } from '../../fixtures';

test.describe('RadioGroup - Determinism', () => {
  test('should render deterministic radio group markup for named and unnamed groups', async ({
    render,
    run,
  }) => {
    await render('namedAndUnnamedMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should render deterministic asChild radio item markup', async ({
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

    expect(await run('checkedStates')).toEqual({
      first: { checked: ['true', 'false'], value: 'small' },
      second: { checked: ['false', 'true'], value: 'medium' },
    });
  });

  test('should not schedule timers during render', async ({ render, run }) => {
    await render('timersDuringRender');

    expect(
      await run<{ timeouts: number; intervals: number }>('scheduled')
    ).toEqual({ timeouts: 0, intervals: 0 });
  });
});
