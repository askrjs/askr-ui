import { expect, test } from '../../fixtures';

interface SwitchContract {
  ROLE: string;
  CHECKED_ATTRIBUTE: string;
  FORM_INTEGRATION: { hiddenInputType: string };
}

test.describe('Switch - Accessibility', () => {
  test('should have no automated axe violations for the native switch path', async ({
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

  test('should expose switch semantics when composed with asChild', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildSemantics');
    const contract = await run<SwitchContract>('contract');
    const element = root.locator(`[role="${contract.ROLE}"]`);

    await expect(element).toHaveAttribute('role', contract.ROLE);
    await expect(element).toHaveAttribute(contract.CHECKED_ATTRIBUTE, 'true');
  });

  test('should use native disabled semantics and hidden form integration when named', async ({
    render,
    root,
    run,
  }) => {
    await render('disabledNamed');
    const contract = await run<SwitchContract>('contract');
    const button = root.locator('button');
    const input = root.locator('input[type="checkbox"]');

    await expect(button).toHaveAttribute('role', contract.ROLE);
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await expect(input).toHaveAttribute('name', 'power');
    await expect(input).toHaveAttribute('value', 'enabled');
    await expect(input).toHaveAttribute(
      'type',
      contract.FORM_INTEGRATION.hiddenInputType
    );
  });

  test('should match the documented switch accessibility contract', async ({
    render,
    run,
  }) => {
    await render('contract');
    const contract = await run<Record<string, unknown>>('contract');

    expect(contract.ROLE).toBe('switch');
    expect(contract.CHECKED_ATTRIBUTE).toBe('aria-checked');
    expect(contract.KEYBOARD_ACTIVATION).toEqual(['Space']);
    expect(contract.DATA_ATTRIBUTES).toEqual({
      slot: 'data-slot',
      state: 'data-state',
      disabled: 'data-disabled',
    });
    expect(contract.FORM_INTEGRATION).toEqual({
      host: 'button',
      hiddenInputType: 'checkbox',
      hiddenInputValue: 'on',
    });
  });
});
