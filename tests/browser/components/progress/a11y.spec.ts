import { expect, test } from '../../fixtures';

test.describe('Progress - Accessibility', () => {
  test('should have no automated axe violations given labelled progress', async ({
    render,
    axeViolations,
  }) => {
    await render('axeLabelledProgress');

    expect(await axeViolations()).toEqual([]);
  });
});
