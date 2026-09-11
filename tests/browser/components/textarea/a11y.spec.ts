import { expect, test } from '../../fixtures';

interface TextareaContract {
  HOST_ELEMENT: string;
  DISABLED_ATTRIBUTES: { native: string; asChild: string };
  DATA_ATTRIBUTES: Record<string, string>;
  FOCUS_RULES: Record<string, number>;
  LABELING: Record<string, boolean>;
}

test.describe('Textarea - Accessibility', () => {
  test('should have no automated axe violations for a labelled native textarea', async ({
    render,
    axeViolations,
  }) => {
    await render('axeNative');

    expect(await axeViolations()).toEqual([]);
  });

  test('should have no automated axe violations for a labelled asChild textarea', async ({
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
    const contract = await run<TextareaContract>('contract');
    const textarea = root.locator('textarea');

    expect(
      await textarea.evaluate((node: HTMLTextAreaElement) => node.disabled)
    ).toBe(true);
    // `disabled` is a boolean attribute: presence is the semantic, and its
    // serialized value is the empty string. Assert presence, not a value.
    await expect(textarea).toHaveAttribute(
      contract.DISABLED_ATTRIBUTES.asChild,
      /.*/
    );
  });

  test('should use native disabled semantics for disabled asChild textarea hosts', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildDisabled');
    const contract = await run<TextareaContract>('contract');
    const host = root.locator('textarea');

    expect(
      await host.evaluate((node: HTMLTextAreaElement) => node.disabled)
    ).toBe(true);
    await expect(host).toHaveAttribute(
      contract.DISABLED_ATTRIBUTES.asChild,
      /.*/
    );
  });

  test('should match the documented textarea accessibility contract', async ({
    render,
    run,
  }) => {
    await render('contract');
    const contract = await run<TextareaContract>('contract');

    expect(contract.HOST_ELEMENT).toBe('textarea');
    expect(contract.DISABLED_ATTRIBUTES).toEqual({
      native: 'disabled',
      asChild: 'disabled',
    });
    expect(contract.DATA_ATTRIBUTES).toEqual({
      disabled: 'data-disabled',
    });
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
