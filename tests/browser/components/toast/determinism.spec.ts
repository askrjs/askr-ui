import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('Toast - Determinism', () => {
  test('should render deterministic toast markup', async ({ render, run }) => {
    await render('toastMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
