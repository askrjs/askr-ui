import { expect, test } from '../../fixtures';

test.describe('Toggle - Accessibility', () => {
  test('should have no automated axe violations for the native toggle path', async ({
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

  test('should use implicit native button semantics for the default host', async ({
    render,
    root,
  }) => {
    await render('nativeSemantics');
    const button = root.locator('button');

    await expect(button).toHaveCount(1);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  test('should use button semantics when composed with asChild', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildSemantics');
    const contract = await run<{ ROLE: string; PRESSED_ATTRIBUTE: string }>(
      'contract'
    );
    const host = root.locator('[role="button"]');

    await expect(host).toHaveAttribute('role', contract.ROLE);
    await expect(host).toHaveAttribute(contract.PRESSED_ATTRIBUTE, 'true');
  });

  test('should use native disabled semantics for the default host', async ({
    render,
    root,
  }) => {
    await render('nativeDisabled');
    const button = root.locator('button');

    await expect(button).toHaveAttribute('disabled');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  test('should use aria-disabled and remove disabled asChild hosts from tab order', async ({
    render,
    root,
  }) => {
    await render('asChildDisabled');
    const host = root.locator('[role="button"]');

    await expect(host).toHaveAttribute('aria-disabled', 'true');
    await expect(host).toHaveAttribute('tabindex', '-1');
  });

  test('should preserve accessible naming props from the host', async ({
    render,
    root,
  }) => {
    await render('accessibleNaming');

    await expect(root.locator('button')).toHaveAttribute(
      'aria-labelledby',
      'toggle-label'
    );
  });

  test('should match the documented toggle accessibility contract', async ({
    render,
    run,
  }) => {
    await render('contract');
    const contract = await run<Record<string, unknown>>('contract');

    expect(contract.ROLE).toBe('button');
    expect(contract.KEYBOARD_ACTIVATION).toEqual(['Enter', 'Space']);
    expect(contract.PRESSED_ATTRIBUTE).toBe('aria-pressed');
    expect(contract.DISABLED_ATTRIBUTES).toEqual({
      nativeButton: {
        disabled: true,
        'aria-disabled': 'true',
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
