import { expect, test } from '../../fixtures';

test.describe('Toggle - Behavior', () => {
  test('should render a native toggle button by default', async ({
    render,
    root,
  }) => {
    await render('nativeDefault');
    const button = root.locator('button');

    await expect(button).toHaveCount(1);
    expect(await button.evaluate((node: HTMLButtonElement) => node.type)).toBe(
      'button'
    );
    await expect(button).toHaveText('Mute');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toHaveAttribute('data-slot', 'toggle');
    await expect(button).toHaveAttribute('data-state', 'off');
  });

  test('should preserve an explicit native button type and pressed hooks', async ({
    render,
    root,
  }) => {
    await render('explicitTypeAndPressed');
    const button = root.locator('button');

    expect(await button.evaluate((node: HTMLButtonElement) => node.type)).toBe(
      'submit'
    );
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveAttribute('data-state', 'on');
  });

  test('should invoke onPress exactly once per native click', async ({
    render,
    root,
    run,
  }) => {
    await render('nativePress');
    await root.locator('button').evaluate((node: HTMLElement) => node.click());

    expect(await run<number>('pressCount')).toBe(1);
  });

  test('should block native interaction when disabled', async ({
    render,
    root,
    run,
  }) => {
    await render('disabledNative');
    const button = root.locator('button');

    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute('aria-disabled', 'true');

    // A programmatic `.click()`, as the vitest original used: Playwright's
    // `locator.click()` would wait for the button to become enabled instead.
    await button.evaluate((node: HTMLElement) => node.click());

    expect(await run<number>('pressCount')).toBe(0);
  });

  test('should support asChild composition and merge host props', async ({
    render,
    root,
  }) => {
    await render('asChildComposition');
    const host = root.locator('[role="button"]');

    await expect(host).toHaveText('Mute');
    await expect(host).toHaveAttribute('data-testid', 'custom-toggle');
    await expect(host).toHaveAttribute('data-from-toggle', 'yes');
    await expect(host).toHaveAttribute('data-from-child', 'yes');
    await expect(host).toHaveAttribute('aria-pressed', 'true');
    await expect(host).toHaveAttribute('data-state', 'on');
    await expect(host).toHaveAttribute('data-slot', 'toggle');
  });

  test('should route interaction through the asChild host element', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildPress');
    await root
      .locator('[role="button"]')
      .evaluate((node: HTMLElement) => node.click());

    expect(await run<number>('pressCount')).toBe(1);
  });

  test('should retain button Enter and Space activation for native and asChild hosts', async ({
    page,
    render,
    run,
  }) => {
    await render('keyboardActivation');

    await run('focusFresh', 'button');
    await page.keyboard.press('Enter');
    await run('focusFresh', 'button');
    await page.keyboard.press(' ');

    await run('focusFresh', '[role="button"]');
    await page.keyboard.press('Enter');
    await run('focusFresh', '[role="button"]');
    await page.keyboard.press(' ');
    await run('flush');

    expect(await run<{ native: number; asChild: number }>('counts')).toEqual({
      native: 2,
      asChild: 2,
    });
  });

  test('should apply disabled semantics to asChild hosts', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildDisabled');
    const host = root.locator('[role="button"]');

    await expect(host).toHaveAttribute('aria-disabled', 'true');
    await expect(host).toHaveAttribute('tabindex', '-1');
    await expect(host).toHaveAttribute('data-disabled', 'true');

    await host.evaluate((node: HTMLElement) => node.click());

    expect(await run<number>('pressCount')).toBe(0);
  });

  test('should forward refs to native and asChild hosts', async ({
    render,
    run,
  }) => {
    await render('refForwarding');

    expect(
      await run<{ nativeMatches: boolean; childMatches: boolean }>('refs')
    ).toEqual({ nativeMatches: true, childMatches: true });
  });
});
