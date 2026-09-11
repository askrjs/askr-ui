import { type DeterministicRender, expectDeterministic } from '../../assertions';
import { test } from '../../fixtures';

test.describe('HoverCard - Determinism', () => {
  test('should render deterministic trigger markup without scheduling timers', async ({
    render,
    run,
  }) => {
    await render('triggerMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
