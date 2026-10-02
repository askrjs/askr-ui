import { expect, test } from '../../fixtures';

test.describe('Select - Accessibility', () => {
  test('should have no automated axe violations given open select', async ({
    render,
    axeViolations,
  }) => {
    await render('openSelect');

    expect(await axeViolations()).toEqual([]);
  });
});
