import { expect, test } from '../../fixtures';

test.describe('Toast - Accessibility', () => {
  test('should have no toast accessibility regressions', async ({
    render,
    axeViolations,
  }) => {
    await render('axeToast');

    expect(await axeViolations()).toEqual([]);
  });

  test('should expose each toast as the single polite live region', async ({
    render,
    root,
  }) => {
    await render('axeToast');
    const toast = root.locator('[data-toast="true"]');

    await expect(toast).toHaveAttribute('role', 'status');
    await expect(toast).toHaveAttribute('aria-live', 'polite');
    await expect(
      root.locator('[data-toast-viewport="true"]')
    ).not.toHaveAttribute('aria-live');
  });
});
