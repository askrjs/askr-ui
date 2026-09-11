import { type DeterministicRender, expectDeterministic } from '../../assertions';
import { test } from '../../fixtures';

test.describe('Avatar - Determinism', () => {
  test('should render deterministic avatar markup', async ({ render, run }) => {
    await render('avatarMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
