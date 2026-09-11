import { expect, test } from '../../fixtures';

test.describe('ProgressCircle - Accessibility', () => {
  test('should have no automated axe violations given labelled circular progress', async ({
    render,
    axeViolations,
  }) => {
    await render('axeLabelledCircularProgress');

    expect(await axeViolations()).toEqual([]);
  });
});
