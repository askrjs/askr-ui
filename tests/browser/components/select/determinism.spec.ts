import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('Select - Determinism', () => {
  test('should render deterministic select markup', async ({ render, run }) => {
    await render('selectMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
