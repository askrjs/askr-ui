import { type DeterministicRender, expectDeterministic } from '../../assertions';
import { test } from '../../fixtures';

test.describe('Dropdown - Determinism', () => {
  test('should render deterministic dropdown markup', async ({
    render,
    run,
  }) => {
    await render('dropdownMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
