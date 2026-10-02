import { expect, test } from '../../fixtures';

test.describe('AlertDialog - Accessibility', () => {
  test('should have no automated axe violations given open alert dialog', async ({
    render,
    axeViolations,
  }) => {
    await render('axeOpenAlertDialog');

    expect(await axeViolations()).toEqual([]);
  });
});
