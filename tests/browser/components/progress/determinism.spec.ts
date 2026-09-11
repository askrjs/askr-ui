import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('Progress - Determinism', () => {
  test('should render deterministic progress markup', async ({
    render,
    run,
  }) => {
    await render('progressMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
