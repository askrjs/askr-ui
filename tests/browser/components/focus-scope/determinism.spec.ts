import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('FocusScope - Determinism', () => {
  test('should render deterministic focus scope markup', async ({
    render,
    run,
  }) => {
    await render('focusScopeMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
