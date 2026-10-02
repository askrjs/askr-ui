import { expect, test } from '../../fixtures';

test.describe('Tooltip - Accessibility', () => {
  test('should have no automated axe violations given open tooltip', async ({
    render,
    axeViolations,
  }) => {
    await render('axeOpenTooltip');

    expect(await axeViolations()).toEqual([]);
  });
});
