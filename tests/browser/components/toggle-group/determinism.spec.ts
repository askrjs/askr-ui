import { type DeterministicRender, expectDeterministic } from '../../assertions';
import { expect, test } from '../../fixtures';

test.describe('ToggleGroup - Determinism', () => {
  test('should render deterministic single and multiple toggle group markup', async ({
    render,
    run,
  }) => {
    await render('groupMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should render deterministic asChild item markup', async ({
    render,
    run,
  }) => {
    await render('asChildMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });

  test('should keep selection props-driven across remounts', async ({
    render,
    run,
  }) => {
    await render('selectionAcrossRemounts');

    expect(
      await run<{ first: string[]; second: string[] }>('pressedStates')
    ).toEqual({ first: ['true', 'false'], second: ['false', 'true'] });
  });

  test('should not schedule timers during render', async ({ render, run }) => {
    await render('timersDuringRender');

    expect(
      await run<{ timeouts: number; intervals: number }>('scheduled')
    ).toEqual({ timeouts: 0, intervals: 0 });
  });
});
