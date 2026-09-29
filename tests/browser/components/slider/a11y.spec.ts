import { expect, test } from '../../fixtures';

test.describe('Slider - Accessibility', () => {
  test('should have no automated axe violations given slider with labelled thumb', async ({
    render,
    axeViolations,
  }) => {
    await render('axeLabelledThumb');

    expect(await axeViolations()).toEqual([]);
  });
});
