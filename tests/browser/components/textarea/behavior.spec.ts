import { expect, test } from '../../fixtures';

test.describe('Textarea - Behavior', () => {
  test('should render a native textarea by default', async ({
    render,
    root,
  }) => {
    await render('nativeDefault');
    const textarea = root.locator('textarea');

    await expect(textarea).toHaveAttribute('rows', '4');
    expect(
      await textarea.evaluate((node: HTMLTextAreaElement) => node.textContent)
    ).toBe('Notes');
    await expect(textarea).toHaveAttribute('data-slot', 'textarea');
  });

  test('should apply disabled semantics to native textarea', async ({
    render,
    root,
  }) => {
    await render('nativeDisabled');
    const textarea = root.locator('textarea');

    expect(
      await textarea.evaluate((node: HTMLTextAreaElement) => node.disabled)
    ).toBe(true);
    await expect(textarea).toHaveAttribute('aria-disabled', 'true');
    await expect(textarea).toHaveAttribute('data-disabled', 'true');
  });

  test('should preserve readonly semantics on native textareas', async ({
    render,
    root,
  }) => {
    await render('nativeReadOnly');
    const textarea = root.locator('textarea');

    expect(
      await textarea.evaluate((node: HTMLTextAreaElement) => node.readOnly)
    ).toBe(true);
    await expect(textarea).toHaveAttribute('readonly');
  });

  test('should support asChild composition and merge host props', async ({
    render,
    root,
  }) => {
    await render('asChildComposition');
    const textarea = root.locator('textarea');

    await expect(textarea).toHaveAttribute('data-testid', 'custom-textarea');
    await expect(textarea).toHaveAttribute('data-from-textarea', 'yes');
    await expect(textarea).toHaveAttribute('data-from-child', 'yes');
    await expect(textarea).toHaveAttribute('data-slot', 'textarea');
  });

  test('should apply native disabled semantics to asChild textarea hosts', async ({
    render,
    root,
  }) => {
    await render('asChildDisabled');
    const host = root.locator('textarea');

    expect(await host.evaluate((node: HTMLTextAreaElement) => node.disabled)).toBe(
      true
    );
    await expect(host).toHaveAttribute('data-disabled', 'true');
  });

  test('should preserve readonly semantics on asChild textarea hosts', async ({
    render,
    root,
  }) => {
    await render('asChildReadOnly');
    const host = root.locator('textarea');

    expect(await host.evaluate((node: HTMLTextAreaElement) => node.readOnly)).toBe(
      true
    );
    await expect(host).toHaveAttribute('readonly');
  });

  test('should fail loudly when asChild does not receive a native textarea host', async ({
    render,
    run,
  }) => {
    await render('asChildWithoutNativeHost');

    expect(await run<string>('error')).toContain(
      'Textarea `asChild` requires a native <textarea> host.'
    );
  });
});
