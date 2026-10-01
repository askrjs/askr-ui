import { expect, test } from '../../fixtures';

test.describe('ScrollArea - Accessibility', () => {
  test('should have no automated axe violations given a labelled viewport', async ({
    render,
    axeViolations,
  }) => {
    await render('axeLabelledViewport');

    expect(await axeViolations()).toEqual([]);
  });
});
