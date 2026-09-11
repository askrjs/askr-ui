import { expect, test } from '../../fixtures';

test.describe('Accordion - Accessibility', () => {
  test('should have no automated axe violations given open accordion item', async ({
    render,
    axeViolations,
  }) => {
    await render('axeOpenItem');

    expect(await axeViolations()).toEqual([]);
  });
});
