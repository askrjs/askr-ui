import { expect, test } from '../../fixtures';

test.describe('FocusScope - Accessibility', () => {
  test('should have no automated axe violations given scoped focusables', async ({
    render,
    axeViolations,
  }) => {
    await render('axeScopedFocusables');

    expect(await axeViolations()).toEqual([]);
  });
});
