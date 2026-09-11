import { expect, test } from '../../fixtures';

interface IconState {
  svgCount: number;
  icon: string | null;
}

interface IconClickState extends IconState {
  pressCount: number;
  sameButton: boolean;
}

test.describe('Button - Behavior', () => {
  test('should render a native button with the default button type', async ({
    render,
    root,
  }) => {
    await render('nativeDefault');
    const button = root.locator('button');

    await expect(button).toHaveCount(1);
    await expect(button).toHaveAttribute('type', 'button');
    await expect(button).toHaveAttribute('data-slot', 'button');
  });

  test('should invoke onPress and merge host props for native buttons', async ({
    render,
    root,
    run,
  }) => {
    await render('nativePress');
    const button = root.locator('button');

    await expect(button).toHaveAttribute('data-testid', 'primary-action');
    await expect(button).toHaveAttribute('aria-label', 'Save');

    await button.evaluate((node: HTMLElement) => node.click());

    expect(await run<number>('pressCount')).toBe(1);
  });

  test('should prevent native interaction when disabled', async ({
    render,
    root,
    run,
  }) => {
    await render('disabledNative');
    const button = root.locator('button');

    expect(
      await button.evaluate((node: HTMLButtonElement) => node.disabled)
    ).toBe(true);
    await expect(button).toHaveAttribute('aria-disabled', 'true');

    // A programmatic `.click()`, as the vitest original used: Playwright's
    // `locator.click()` would wait for the button to become enabled instead.
    await button.evaluate((node: HTMLElement) => node.click());

    expect(await run<number>('pressCount')).toBe(0);
  });

  test('should support asChild hosts with composed props and disabled semantics', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildDisabledLink');
    const link = root.locator('a');

    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute('data-from-button', 'yes');
    await expect(link).toHaveAttribute('data-from-child', 'yes');
    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).toHaveAttribute('tabindex', '-1');
    await expect(link).not.toHaveAttribute('role');

    expect(await run<boolean>('dispatchEnter')).toBe(true);

    await run('click');

    expect(await run<number>('pressCount')).toBe(0);
  });

  test('should preserve native anchor semantics given an enabled asChild link', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildEnabledLink');
    const link = root.locator('a');

    const defaultPrevented = await run<boolean>('dispatchEnter');

    await expect(link).not.toHaveAttribute('role');
    await expect(link).not.toHaveAttribute('tabindex');
    expect(defaultPrevented).toBe(false);

    await run('clickWithoutNavigation');

    expect(await run<number>('pressCount')).toBe(1);
  });

  test('should preserve native anchor semantics given an Askr Link child', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildAskrLink');
    const link = root.locator('a');

    const defaultPrevented = await run<boolean>('dispatchEnter');

    await expect(link).not.toHaveAttribute('role');
    expect(defaultPrevented).toBe(false);
  });

  test('should use native semantics given a button asChild host', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildNativeButton');
    const button = root.locator('button');

    expect(
      await button.evaluate((node: HTMLButtonElement) => node.disabled)
    ).toBe(true);
    await expect(button).not.toHaveAttribute('role');

    await run('click');

    expect(await run<number>('pressCount')).toBe(0);
  });

  test('should retain synthetic button semantics given a non-native asChild host', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildSyntheticHost');
    const host = root.locator('span');

    await expect(host).toHaveAttribute('role', 'button');
    await expect(host).toHaveAttribute('tabindex', '0');

    await run('dispatchEnter');

    expect(await run<number>('pressCount')).toBe(1);
  });

  test('should activate a non-native asChild host with Enter and Space', async ({
    page,
    render,
    run,
  }) => {
    await render('asChildKeyboardActivation');

    await run('focusHost');
    await page.keyboard.press('Enter');
    await run('focusHost');
    await page.keyboard.press(' ');

    expect(await run<number>('pressCount')).toBe(2);
  });

  test('should replace stateful icon children instead of accumulating them', async ({
    render,
    run,
  }) => {
    await render('statefulIconChildren');

    expect(await run<IconState>('initial')).toEqual({
      svgCount: 1,
      icon: 'sun',
    });

    expect(await run<IconClickState>('clickAndRead')).toEqual({
      pressCount: 1,
      sameButton: true,
      svgCount: 1,
      icon: 'moon',
    });

    expect(await run<IconClickState>('clickAndRead')).toEqual({
      pressCount: 2,
      sameButton: true,
      svgCount: 1,
      icon: 'sun',
    });
  });
});
