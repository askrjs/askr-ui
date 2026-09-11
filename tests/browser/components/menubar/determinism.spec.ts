import { type DeterministicRender, expectDeterministic } from '../../assertions';
import { test } from '../../fixtures';

test.describe('Menubar - Determinism', () => {
  test('should render deterministic menubar markup', async ({ render, run }) => {
    await render('menubarMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
