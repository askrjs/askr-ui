import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('Menu - Determinism', () => {
  test('should render deterministic menu markup', async ({ render, run }) => {
    await render('menuMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
