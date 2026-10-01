import { expect, test } from '../../fixtures';

test.describe('Checkbox - Behavior', () => {
  test('should render a native checkbox input by default', async ({
    render,
    root,
  }) => {
    await render('nativeDefault');
    const input = root.locator('input[type="checkbox"]');

    await expect(input).toHaveCount(1);
    await expect(input).toHaveAttribute('data-slot', 'checkbox');
    await expect(input).toHaveAttribute('data-state', 'unchecked');
    await expect(input).toHaveAttribute('aria-checked', 'false');
  });

  test('should invoke onPress exactly once per native click', async ({
    render,
    root,
    run,
  }) => {
    await render('nativePress');
    await root.locator('input').click();

    expect(await run<number>('pressCount')).toBe(1);
  });

  test('should emit uncontrolled state changes through onCheckedChange', async ({
    render,
    root,
    run,
  }) => {
    await render('uncontrolled');
    const input = root.locator('input');

    await expect(input).not.toBeChecked();

    await input.click();

    expect(await run<boolean[][]>('calls')).toContainEqual([true]);
    await expect(input).toBeChecked();
    await expect(input).toHaveAttribute('data-state', 'checked');
  });

  test('should call onCheckedChange in controlled mode', async ({
    render,
    root,
    run,
  }) => {
    await render('controlled');
    await root.locator('input').click();

    expect(await run<boolean[][]>('calls')).toContainEqual([true]);
  });

  test('should block native interaction when disabled', async ({
    render,
    root,
    run,
  }) => {
    await render('disabledNative');
    const input = root.locator('input');

    await expect(input).toBeDisabled();
    await expect(input).toHaveAttribute('aria-disabled', 'true');

    // A programmatic `.click()`, as the vitest original used: Playwright's
    // `locator.click()` would wait for the input to become enabled instead.
    await input.evaluate((node: HTMLElement) => node.click());

    expect(await run<number>('pressCount')).toBe(0);
  });

  test('should apply checked and indeterminate state hooks to the native host', async ({
    render,
    root,
  }) => {
    await render('checkedIndeterminate');
    const input = root.locator('input');

    await expect(input).toHaveCount(1);
    await expect(input).not.toHaveAttribute('aria-checked');
    await expect(input).toHaveAttribute('data-state', 'indeterminate');
    expect(
      await input.evaluate((node: HTMLInputElement) => node.indeterminate)
    ).toBe(true);
  });

  test('should update native indeterminate state on a retained input', async ({
    render,
    run,
  }) => {
    await render('retainedIndeterminate');

    expect(await run('snapshot')).toEqual({
      sameInput: true,
      refIsInput: true,
      indeterminate: false,
    });

    await run('setIndeterminate', true);
    expect(await run('snapshot')).toEqual({
      sameInput: true,
      refIsInput: true,
      indeterminate: true,
    });

    await run('setIndeterminate', false);
    expect(await run('snapshot')).toEqual({
      sameInput: true,
      refIsInput: true,
      indeterminate: false,
    });
  });

  test('should forward refs to the asChild host', async ({ render, run }) => {
    await render('asChildRef');

    expect(await run<boolean>('refIsHost')).toBe(true);
  });

  test('should ignore Enter and toggle native and asChild hosts with Space', async ({
    render,
    root,
    run,
  }) => {
    await render('keyboardActivation');
    const nativeCheckbox = root.locator('[data-testid="native-checkbox"]');
    const checkbox = root.locator('[data-slot="checkbox"]:not(input)');

    await nativeCheckbox.press('Enter');
    await expect(nativeCheckbox).not.toBeChecked();
    expect(await run('nativeCalls')).toEqual([]);

    await nativeCheckbox.press('Space');
    await expect(nativeCheckbox).toBeChecked();
    expect(await run('nativeCalls')).toEqual([[true]]);

    await checkbox.press('Enter');
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(await run('childCalls')).toEqual([]);

    await checkbox.press('Space');
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(await run('childCalls')).toEqual([[true]]);
  });

  test('should restore uncontrolled state when its native form resets', async ({
    render,
    root,
    run,
  }) => {
    await render('formReset');
    const input = root.locator('input');

    await input.click();
    await expect(input).toBeChecked();

    await run('reset');
    await expect(input).not.toBeChecked();
    expect(await run('calls')).toEqual([[true], [false]]);
  });

  test('should honor caller cancellation for asChild keyboard presses', async ({
    render,
    root,
    run,
  }) => {
    await render('cancelledAsChildPress');
    const checkbox = root.locator('[data-slot="checkbox"]');

    await checkbox.press('Enter');
    await checkbox.press('Space');

    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(await run('calls')).toEqual([]);
  });
});
