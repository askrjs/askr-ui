import { expect, test } from '../../fixtures';

test.describe('Menu - Accessibility', () => {
  test('should have no automated axe violations given open menu content', async ({
    render,
    axeViolations,
  }) => {
    await render('openMenuContent');

    expect(await axeViolations()).toEqual([]);
  });
});
