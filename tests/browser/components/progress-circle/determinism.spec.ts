import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('ProgressCircle - Determinism', () => {
  test('should render deterministic circular progress markup', async ({
    render,
    run,
  }) => {
    await render('circularProgressMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
