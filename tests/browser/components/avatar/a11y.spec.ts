import { expect, test } from '../../fixtures';

test.describe('Avatar - Accessibility', () => {
  test('should have no automated axe violations given image and fallback', async ({
    render,
    axeViolations,
  }) => {
    await render('axeImageAndFallback');

    expect(await axeViolations()).toEqual([]);
  });
});
