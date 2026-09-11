import { expect, test } from '../../fixtures';

test.describe('Form - Accessibility', () => {
  test('should have no automated axe violations given labelled controls', async ({
    render,
    axeViolations,
  }) => {
    await render('axeLabelledControls');

    expect(await axeViolations()).toEqual([]);
  });
});
