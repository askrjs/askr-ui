import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('ScrollArea - Determinism', () => {
  test('should render deterministic IDs and range markup', async ({
    render,
    run,
  }) => {
    await render('scrollAreaMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
