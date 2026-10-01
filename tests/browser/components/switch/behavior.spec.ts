import { expect, test } from '../../fixtures';

test.describe('Switch - Behavior', () => {
  test('should render native switch semantics by default', async ({
    render,
    root,
  }) => {
    await render('nativeDefault');
    const button = root.locator('button');

    await expect(button).toHaveCount(1);
    expect(await button.evaluate((node: HTMLButtonElement) => node.type)).toBe(
      'button'
    );
    await expect(button).toHaveAttribute('role', 'switch');
    await expect(button).toHaveAttribute('aria-checked', 'false');
    await expect(button).not.toHaveAttribute('aria-pressed');
    await expect(button).toHaveAttribute('data-slot', 'switch');
    await expect(button).toHaveAttribute('data-state', 'unchecked');
  });

  test('should preserve an explicit native button type and checked state hooks', async ({
    render,
    root,
  }) => {
    await render('explicitTypeAndChecked');
    const button = root.locator('button');

    expect(await button.evaluate((node: HTMLButtonElement) => node.type)).toBe(
      'submit'
    );
    await expect(button).toHaveAttribute('aria-checked', 'true');
    await expect(button).toHaveAttribute('data-state', 'checked');
  });

  test('should emit uncontrolled state changes through onCheckedChange', async ({
    render,
    root,
    run,
  }) => {
    await render('uncontrolled');
    const button = root.locator('button');

    await expect(button).toHaveAttribute('aria-checked', 'false');

    await button.click();

    expect(await run<boolean[][]>('calls')).toContainEqual([true]);
  });

  test('should call onCheckedChange in controlled mode', async ({
    render,
    root,
    run,
  }) => {
    await render('controlled');
    await root.locator('button').click();

    expect(await run<boolean[][]>('calls')).toContainEqual([true]);
  });

  test('should render hidden form input when named', async ({
    render,
    root,
  }) => {
    await render('namedHiddenInput');
    const input = root.locator('input[type="checkbox"]');

    expect(
      await input.evaluate((node: HTMLInputElement) => ({
        hidden: node.hidden,
        tabIndex: node.tabIndex,
        name: node.name,
        value: node.value,
        checked: node.checked,
      }))
    ).toEqual({
      hidden: true,
      tabIndex: -1,
      name: 'notifications',
      value: 'enabled',
      checked: true,
    });
    await expect(input).toHaveAttribute('aria-hidden', 'true');
  });

  test('should keep the hidden form input in sync after uncontrolled presses', async ({
    render,
    root,
  }) => {
    await render('hiddenInputSync');
    const button = root.locator('button');
    const input = root.locator('input[type="checkbox"]');

    await expect(button).toHaveAttribute('aria-checked', 'false');
    await expect(input).not.toBeChecked();

    await button.click();

    await expect(button).toHaveAttribute('aria-checked', 'true');
    await expect(button).toHaveAttribute('data-state', 'checked');
    await expect(input).toBeChecked();
  });

  test('should support asChild composition and merge host props', async ({
    render,
    root,
  }) => {
    await render('asChildComposition');
    const host = root.locator('[role="switch"]');

    await expect(host).toHaveText('Power');
    await expect(host).toHaveAttribute('data-testid', 'power-switch');
    await expect(host).toHaveAttribute('data-from-switch', 'yes');
    await expect(host).toHaveAttribute('data-from-child', 'yes');
    await expect(host).toHaveAttribute('role', 'switch');
    await expect(host).toHaveAttribute('aria-checked', 'true');
    await expect(host).toHaveAttribute('data-state', 'checked');
  });

  test('should ignore Enter and toggle native and asChild hosts with Space', async ({
    render,
    root,
    run,
  }) => {
    await render('keyboardActivation');
    const nativeHost = root.locator('[data-testid="native-switch"]');
    const host = root.locator('[role="switch"]').nth(1);

    await nativeHost.press('Enter');
    await expect(nativeHost).toHaveAttribute('aria-checked', 'false');
    expect(await run('nativeCalls')).toEqual([]);

    await nativeHost.press('Space');
    await expect(nativeHost).toHaveAttribute('aria-checked', 'true');
    expect(await run('nativeCalls')).toEqual([[true]]);

    await host.press('Enter');
    await expect(host).toHaveAttribute('aria-checked', 'false');

    await host.press('Space');
    await expect(host).toHaveAttribute('aria-checked', 'true');
    expect(await run('childCalls')).toEqual([[true]]);
  });

  test('should restore uncontrolled state when its native form resets', async ({
    render,
    root,
    run,
  }) => {
    await render('formReset');
    const host = root.locator('[role="switch"]');

    await host.click();
    await expect(host).toHaveAttribute('aria-checked', 'true');

    await run('reset');
    await expect(host).toHaveAttribute('aria-checked', 'false');
    expect(await run('calls')).toEqual([[true], [false]]);
  });

  test('should apply disabled semantics to asChild hosts', async ({
    render,
    root,
    run,
  }) => {
    await render('disabledAsChild');
    const host = root.locator('[role="switch"]');

    await expect(host).toHaveAttribute('aria-disabled', 'true');
    await expect(host).toHaveAttribute('tabindex', '-1');
    await expect(host).toHaveAttribute('data-disabled', 'true');

    // A programmatic `.click()`, as the vitest original used: Playwright's
    // `locator.click()` would wait for the host to become enabled instead.
    await host.evaluate((node: HTMLElement) => node.click());

    expect(await run('calls')).toEqual([]);
  });

  test('should forward refs to native and asChild hosts', async ({
    render,
    run,
  }) => {
    await render('forwardedRefs');

    expect(await run('refs')).toEqual({
      nativeMatches: true,
      childMatches: true,
    });
  });
});
