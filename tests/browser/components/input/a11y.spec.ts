import { expect, test } from '../../fixtures';

interface InputContract {
  HOST_ELEMENT: string;
  DISABLED_ATTRIBUTES: { native: string; asChild: string };
  DATA_ATTRIBUTES: Record<string, string>;
  FOCUS_RULES: Record<string, number>;
  LABELING: Record<string, boolean>;
}

test.describe('Input - Accessibility', () => {
  test('should have no automated axe violations for a labelled native input', async ({
    render,
    axeViolations,
  }) => {
    await render('axeNative');

    expect(await axeViolations()).toEqual([]);
  });

  test('should have no automated axe violations for a labelled asChild input', async ({
    render,
    axeViolations,
  }) => {
    await render('axeAsChild');

    expect(await axeViolations()).toEqual([]);
  });

  test('should use native disabled semantics for the default host', async ({
    render,
    root,
    run,
  }) => {
    await render('nativeDisabled');
    const contract = await run<InputContract>('contract');
    const input = root.locator('input');

    expect(
      await input.evaluate((node: HTMLInputElement) => node.disabled)
    ).toBe(true);
    // Native `disabled` is a boolean attribute; presence carries the semantic.
    await expect(input).toHaveAttribute(
      contract.DISABLED_ATTRIBUTES.native,
      /.*/
    );
  });

  test('should use native disabled semantics for disabled asChild input hosts', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildDisabled');
    const contract = await run<InputContract>('contract');
    const input = root.locator('input');

    expect(
      await input.evaluate((node: HTMLInputElement) => node.disabled)
    ).toBe(true);
    await expect(input).toHaveAttribute(
      contract.DISABLED_ATTRIBUTES.asChild,
      /.*/
    );
  });

  test('should match the documented input accessibility contract', async ({
    render,
    run,
  }) => {
    await render('contract');
    const contract = await run<InputContract>('contract');

    expect(contract.HOST_ELEMENT).toBe('input');
    expect(contract.DISABLED_ATTRIBUTES).toEqual({
      native: 'disabled',
      asChild: 'disabled',
    });
    expect(contract.DATA_ATTRIBUTES).toEqual({ disabled: 'data-disabled' });
    expect(contract.FOCUS_RULES).toEqual({
      defaultTabIndex: 0,
      disabledTabIndex: -1,
    });
    expect(contract.LABELING).toEqual({
      supportsLabelElement: true,
      supportsAriaLabel: true,
      supportsAriaLabelledBy: true,
    });
  });
});
