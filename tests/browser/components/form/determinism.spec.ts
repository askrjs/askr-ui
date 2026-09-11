import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('Form - Determinism', () => {
  test('should render deterministic form markup', async ({ render, run }) => {
    await render('formMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
