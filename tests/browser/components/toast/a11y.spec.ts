import { expect, test } from '../../fixtures';

test.describe('Toast - Accessibility', () => {
  test('should have no toast accessibility regressions', async ({
    render,
    axeViolations,
  }) => {
    await render('axeToast');

    expect(await axeViolations()).toEqual([]);
  });
});
