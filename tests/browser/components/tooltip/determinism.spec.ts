import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('Tooltip - Determinism', () => {
  test('should render deterministic tooltip markup', async ({ render, run }) => {
    await render('tooltipMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
