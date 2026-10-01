import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('AlertDialog - Determinism', () => {
  test('should render deterministic alert dialog markup', async ({
    render,
    run,
  }) => {
    await render('alertDialogMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
