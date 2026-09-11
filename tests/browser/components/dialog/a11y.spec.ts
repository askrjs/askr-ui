import { expect, test } from '../../fixtures';

test.describe('Dialog - Accessibility', () => {
  test('should have no automated axe violations given open dialog', async ({
    render,
    axeViolations,
  }) => {
    await render('axeOpenDialog');

    expect(await axeViolations()).toEqual([]);
  });
});
