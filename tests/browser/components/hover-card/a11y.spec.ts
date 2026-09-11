import { expect, test } from '../../fixtures';

test.describe('HoverCard - Accessibility', () => {
  test('should have no automated axe violations given interactive content', async ({
    render,
    axeViolations,
  }) => {
    await render('axeInteractiveContent');

    expect(await axeViolations()).toEqual([]);
  });
});
