import { type DeterministicRender, expectDeterministic } from '../../assertions';
import { test } from '../../fixtures';

test.describe('Table - Determinism', () => {
  test('should render deterministic table markup', async ({ render, run }) => {
    await render('tableMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
