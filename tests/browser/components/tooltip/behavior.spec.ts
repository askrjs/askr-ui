import { expect, test } from '../../fixtures';

test.describe('Tooltip - Behavior', () => {
  test('should update trigger state around focus events', async ({
    page,
    render,
    root,
  }) => {
    await render('hoverTrigger');
    const trigger = root.locator('button');

    await trigger.hover();
    await expect(trigger).toHaveAttribute('data-state', 'open');

    await page.mouse.move(1000, 800);
    await expect(trigger).toHaveAttribute('data-state', 'closed');
  });

  test('should open once from native focus without exhausting the scheduler', async ({
    page,
    render,
    root,
    run,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await render('nativeFocusAlongsideControls');

    expect(await run('focus', '[data-testid="button-control"]')).toBeNull();
    await expect(root.getByTestId('button-control')).toBeFocused();

    expect(await run('focus', '[data-slot="hover-card-trigger"]')).toBeNull();
    await run('settle');
    expect(await run<number>('hoverCardOpenChanges')).toBe(1);

    expect(await run('focus', '[data-slot="tooltip-trigger"]')).toBeNull();
    const trigger = root.locator('[data-slot="tooltip-trigger"]');
    await expect(trigger).toHaveAttribute('data-state', 'open');
    await run('settle');
    await expect(trigger).toBeFocused();
    expect(await run<boolean[][]>('openChanges')).toHaveLength(1);
    expect(pageErrors).toEqual([]);
  });

  test('should open from a real keyboard Tab and preserve focus on the trigger', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('keyboardTab');
    const before = root.getByTestId('before');

    await before.focus();
    await expect(before).toBeFocused();
    await page.keyboard.press('Tab');

    const trigger = root.locator('[data-slot="tooltip-trigger"]');
    await expect(trigger).toHaveAttribute('data-state', 'open');
    await run('settle');
    expect(await run<boolean[][]>('openChanges')).toEqual([[true]]);
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('data-state', 'open');
  });

  test('should keep a controlled native-focus request bounded when the owner does not accept it', async ({
    page,
    render,
    root,
    run,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    await render('controlledClosed');

    expect(await run('focusTrigger')).toBeNull();
    await run('settle');

    const trigger = root.locator('[data-slot="tooltip-trigger"]');
    expect(await run<number>('openChanges')).toBe(1);
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await expect(trigger).toBeFocused();
    expect(pageErrors).toEqual([]);
  });

  test('should allow one controlled native-focus request in each focus cycle', async ({
    render,
    run,
  }) => {
    await render('controlledClosed');

    expect(await run('focusTrigger')).toBeNull();
    await run('settle');
    expect(await run<number>('openChanges')).toBe(1);

    expect(await run('focusOutside')).toBeNull();
    expect(await run('focusTrigger')).toBeNull();
    await run('settle');
    expect(await run<number>('openChanges')).toBe(2);
  });

  test('should keep one controlled focus request while focus moves within an asChild trigger', async ({
    render,
    root,
    run,
  }) => {
    await render('controlledClosedWithFocusChildren');

    await root.getByTestId('tooltip-trigger').focus();
    await run('settle');
    expect(await run<number>('openChanges')).toBe(1);

    await root.getByTestId('nested-focus-target').focus();
    await run('settle');
    await root.getByTestId('tooltip-trigger').focus();
    await run('settle');
    expect(await run<number>('openChanges')).toBe(1);
    await expect(root.getByTestId('tooltip-trigger')).toBeFocused();
  });

  test('should not reclaim focus after a removed trigger loses focus', async ({
    render,
    root,
    run,
  }) => {
    await render('controlledTriggerReplacement');

    await root.getByTestId('tooltip-trigger').focus();
    await run('settle');
    expect(await run<number>('openChanges')).toBe(1);

    await run('removeTrigger');
    await run('focusOutside');
    await run('remountTrigger');
    await run('settle');

    await expect(root.getByTestId('outside')).toBeFocused();
    expect(await run<number>('openChanges')).toBe(1);
  });

  test('should preserve focus when a removed trigger is replaced', async ({
    render,
    root,
    run,
  }) => {
    await render('controlledTriggerReplacement');

    await root.getByTestId('tooltip-trigger').focus();
    await run('settle');
    expect(await run<number>('openChanges')).toBe(1);

    await run('removeTrigger');
    await run('remountTrigger');
    await run('settle');

    await expect(root.getByTestId('tooltip-trigger')).toBeFocused();
    expect(await run<number>('openChanges')).toBe(1);
  });

  test('should cancel pending focus-adoption work during teardown', async ({
    render,
    run,
  }) => {
    await render('teardownDuringFocusAdoption');

    expect(await run<number[]>('focusThenUnmount')).toContain(73);
  });

  test('should keep custom content positioning through the post-open portal sync', async ({
    page,
    render,
    root,
  }) => {
    await render('customPosition');

    await root.locator('button').hover();

    const content = page.locator('[data-slot="tooltip-content"]');
    await expect(content).toHaveAttribute('data-side', 'right');
    expect(
      await content.evaluate((node) => (node as HTMLElement).dataset.side)
    ).toBe('right');
    await expect(content).not.toHaveAttribute('style');
    await expect(content).toHaveCSS('left', '148px');
    await expect(content).toHaveCSS('top', '90px');
  });
});
