import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('VisuallyHidden - Determinism', () => {
  test('should render deterministic visually hidden markup', async ({
    render,
    run,
  }) => {
    await render('visuallyHiddenMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
