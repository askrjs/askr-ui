import { expect, test } from '../../fixtures';

test.describe('Dropdown - Accessibility', () => {
  test('should have no automated axe violations given open dropdown', async ({
    render,
    axeViolations,
  }) => {
    await render('axeOpenDropdown');

    expect(await axeViolations()).toEqual([]);
  });
});
