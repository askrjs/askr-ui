import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('VirtualList - Determinism', () => {
  test('should render deterministic virtual list markup', async ({
    render,
    run,
  }) => {
    await render('virtualListMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
