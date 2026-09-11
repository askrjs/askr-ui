import { type DeterministicRender, expectDeterministic } from '../../assertions';
import { test } from '../../fixtures';

test.describe('OverlayHost - Determinism', () => {
  test('should render deterministic hosted overlay markup', async ({
    render,
    run,
  }) => {
    await render('hostedOverlayMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
