import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('Dialog - Determinism', () => {
  test('should render deterministic dialog markup', async ({ render, run }) => {
    await render('dialogMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
