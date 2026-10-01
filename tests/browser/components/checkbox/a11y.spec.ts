import { expect, test } from '../../fixtures';

test.describe('Checkbox - Accessibility', () => {
  test('should have no automated axe violations for a labelled native checkbox', async ({
    render,
    axeViolations,
  }) => {
    await render('axeLabelledNative');

    expect(await axeViolations()).toEqual([]);
  });

  test('should have no automated axe violations for a labelled asChild checkbox', async ({
    render,
    axeViolations,
  }) => {
    await render('axeLabelledAsChild');

    expect(await axeViolations()).toEqual([]);
  });

  test('should use implicit native checkbox semantics for the default host', async ({
    render,
    root,
  }) => {
    await render('nativeSemantics');
    const input = root.locator('input');

    expect(await input.evaluate((node: HTMLInputElement) => node.type)).toBe(
      'checkbox'
    );
    await expect(input).toHaveAttribute('aria-checked', 'false');
  });

  test('should use mixed aria state for indeterminate asChild hosts', async ({
    render,
    root,
    run,
  }) => {
    await render('indeterminateAsChild');
    const contract = await run<{ ROLE: string; INDETERMINATE_VALUE: string }>(
      'contract'
    );
    const host = root.locator('[role="checkbox"]');

    await expect(host).toHaveAttribute('role', contract.ROLE);
    await expect(host).toHaveAttribute(
      'aria-checked',
      contract.INDETERMINATE_VALUE
    );
  });

  test('should keep native indeterminate checkboxes in the indeterminate state contract', async ({
    render,
    root,
  }) => {
    await render('indeterminateNative');
    const input = root.locator('input');

    await expect(input).toHaveCount(1);
    await expect(input).not.toHaveAttribute('aria-checked');
    await expect(input).toHaveAttribute('data-state', 'indeterminate');
  });

  test('should use aria-disabled and remove disabled asChild hosts from tab order', async ({
    render,
    root,
  }) => {
    await render('disabledAsChild');
    const host = root.locator('[role="checkbox"]');

    await expect(host).toHaveAttribute('aria-disabled', 'true');
    await expect(host).toHaveAttribute('tabindex', '-1');
  });

  test('should match the documented checkbox accessibility contract', async ({
    render,
    run,
  }) => {
    await render('contract');
    const contract = await run<Record<string, unknown>>('contract');

    expect(contract.ROLE).toBe('checkbox');
    expect(contract.KEYBOARD_ACTIVATION).toEqual(['Space']);
    expect(contract.CHECKED_ATTRIBUTE).toBe('aria-checked');
    expect(contract.INDETERMINATE_VALUE).toBe('mixed');
    expect(contract.DISABLED_ATTRIBUTES).toEqual({
      nativeInput: {
        disabled: true,
      },
      nonNative: {
        'aria-disabled': 'true',
        tabIndex: -1,
      },
    });
    expect(contract.DATA_ATTRIBUTES).toEqual({
      state: 'data-state',
      disabled: 'data-disabled',
    });
  });
});
