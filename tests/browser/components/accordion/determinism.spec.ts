import { type DeterministicRender, expectDeterministic } from '../../assertions';
import { test } from '../../fixtures';

test.describe('Accordion - Determinism', () => {
  test('should render deterministic accordion markup', async ({
    render,
    run,
  }) => {
    await render('accordionMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
