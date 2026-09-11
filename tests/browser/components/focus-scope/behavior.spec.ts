import { expect, test } from '../../fixtures';

test.describe('FocusScope - Behavior', () => {
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
