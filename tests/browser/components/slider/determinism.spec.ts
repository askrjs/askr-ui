import {
  type DeterministicRender,
  expectDeterministic,
} from '../../assertions';
import { test } from '../../fixtures';

test.describe('Slider - Determinism', () => {
  test('should render deterministic slider markup', async ({ render, run }) => {
    await render('sliderMarkup');

    await expectDeterministic(await run<DeterministicRender[]>('renders'));
  });
});
