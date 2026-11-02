import { expect, test } from '../../fixtures';

test.describe('FocusScope - Behavior', () => {
  test('should compose caller and child host refs when rendered asChild', async ({
    render,
    run,
  }) => {
    await render('asChildChildRef');
    expect(
      await run<{ childRefAttached: boolean; callerRefAttached: boolean }>(
        'refsAttached'
      )
    ).toEqual({ childRefAttached: true, callerRefAttached: true });
  });

  test('should preserve a native asChild host in the tab order', async ({
    render,
    run,
  }) => {
    await render('focusableAsChildHost');
    expect(await run<number>('hostTabIndex')).toBe(0);
  });

  test('should wrap Tab at the last tabbable child when a programmatic-only child follows', async ({
    page,
    render,
    root,
  }) => {
    await render('loopSkipsProgrammaticFocusTarget');
    await root.getByTestId('last').focus();
    await page.keyboard.press('Tab');
    await expect(root.getByTestId('first')).toBeFocused();
  });

  test('should autofocus an empty asChild scope host', async ({
    render,
    run,
  }) => {
    await render('emptyAsChildAutoFocus');
    expect(await run<boolean>('hostFocused')).toBe(true);
  });

  test('should preserve focus when a caller cancels looping Tab defaults', async ({
    page,
    render,
    root,
  }) => {
    await render('callerCanceledTab');
    await root.getByTestId('last').focus();
    await page.keyboard.press('Tab');
    await expect(root.getByTestId('last')).toBeFocused();
    await root.getByTestId('first').focus();
    await page.keyboard.press('Shift+Tab');
    await expect(root.getByTestId('first')).toBeFocused();
  });

  test('should preserve focus after an ancestor cancels looping Tab defaults', async ({
    page,
    render,
    root,
  }) => {
    await render('ancestorCanceledTab');
    await root.getByTestId('last').focus();
    await page.keyboard.press('Tab');
    await expect(root.getByTestId('last')).toBeFocused();
    await root.getByTestId('first').focus();
    await page.keyboard.press('Shift+Tab');
    await expect(root.getByTestId('first')).toBeFocused();
  });

  test('should let native Tab leave a scope when looping and trapping are disabled', async ({
    page,
    render,
    root,
  }) => {
    await render('nativeTabLeavesScope');
    await root.getByTestId('last').focus();
    await page.keyboard.press('Tab');
    await expect(root.getByTestId('after')).toBeFocused();

    await root.getByTestId('first').focus();
    await page.keyboard.press('Shift+Tab');
    await expect(root.getByTestId('before')).toBeFocused();
  });

  test('should support manual focus inside the scope without breaking the focus target', async ({
    render,
    run,
  }) => {
    await render('manualFocusInsideScope');

    // Browser-side identity comparison: the original asserted against
    // `document.activeElement`, and DOM nodes cannot cross into the spec.
    expect(
      await run<{ focusedFirst: boolean; focusedTrigger: boolean }>('focus')
    ).toEqual({ focusedFirst: true, focusedTrigger: false });
  });

  test('should wrap keyboard focus when loop is enabled', async ({
    render,
    run,
  }) => {
    await render('loopWrapsFocus');

    expect(await run<boolean>('focusedFirst')).toBe(true);
  });

  test('should keep focus trapped within scope on focus-out when trapped is enabled', async ({
    render,
    run,
  }) => {
    await render('trappedFocusOut');

    expect(await run<boolean>('focusedInside')).toBe(true);
  });
});
