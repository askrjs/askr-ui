import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('DismissableLayer - Determinism', () => {
  test('should render deterministic dismissable layer markup', async ({
    render,
    run,
  }) => {
    await render('dismissableLayerMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
