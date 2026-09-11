import { expect, test } from '../../fixtures';

test.describe('Button - Accessibility', () => {
  test('should have no automated axe violations for the native button path', async ({
    render,
    axeViolations,
  }) => {
    await render('axeNative');

    expect(await axeViolations()).toEqual([]);
  });

  test('should have no automated axe violations for labelled asChild composition', async ({
    render,
    axeViolations,
  }) => {
    await render('axeAsChild');

    expect(await axeViolations()).toEqual([]);
  });

  test('should use native disabled semantics for the default host', async ({
    render,
    root,
  }) => {
    await render('nativeDisabled');
    const button = root.locator('button');

    expect(
      await button.evaluate((node: HTMLButtonElement) => node.disabled)
    ).toBe(true);
    await expect(button).toHaveAttribute('disabled');
  });

  test('should use aria-disabled and remove disabled asChild hosts from tab order', async ({
    render,
    root,
  }) => {
    await render('asChildDisabled');
    const link = root.locator('a');

    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).toHaveAttribute('tabindex', '-1');
  });

  test('should preserve accessible naming props from the host', async ({
    render,
    root,
  }) => {
    await render('accessibleNaming');

    await expect(root.locator('button')).toHaveAttribute(
      'aria-labelledby',
      'button-label'
    );
  });

  test('should match the documented button accessibility contract', async ({
    render,
    run,
  }) => {
    await render('contract');
    const contract = await run<Record<string, unknown>>('contract');

    expect(contract.ROLE).toBe('button');
    expect(contract.KEYBOARD_ACTIVATION).toEqual(['Enter', 'Space']);
    expect(contract.DISABLED_ATTRIBUTES).toEqual({
      native: 'disabled',
      asChild: 'aria-disabled',
    });
  });
});
