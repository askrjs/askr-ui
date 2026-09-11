import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('Popover - Determinism', () => {
  test('should render deterministic popover markup', async ({
    render,
    run,
  }) => {
    await render('popoverMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
