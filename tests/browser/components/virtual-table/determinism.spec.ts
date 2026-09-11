import { type DeterministicRender, expectDeterministic } from '../../assertions';
import { test } from '../../fixtures';

test.describe('VirtualTable - Determinism', () => {
  test('should render deterministic virtual table markup', async ({
    render,
    run,
  }) => {
    await render('virtualTableMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
