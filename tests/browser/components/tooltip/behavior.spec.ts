import { captureFocusTarget } from '../../assertions';
import { expect, HARNESS_URL, test } from '../../fixtures';

test.describe('Tooltip - Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(HARNESS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => 'askrHarness' in window);
    // Park in the harness document before mounting. Chromium can deliver a
    // pointerover after layout under a stationary pointer; that independent
    // hover request must not contaminate the focus-only callback assertions.
    const viewport = page.viewportSize();
    await page.mouse.move(
      (viewport?.width ?? 1280) - 1,
      (viewport?.height ?? 720) - 1
    );
  });

  test('should keep a disabled asChild trigger closed when programmatically focused', async ({
    render,
    root,
    run,
  }) => {
    await render('disabledFocusTrigger');
    await root.locator('[data-slot="tooltip-trigger"]').focus();
    await expect(root.locator('[data-slot="tooltip-trigger"]')).toHaveAttribute(
      'data-state',
      'closed'
    );
    expect(await run('openChanges')).toEqual([]);
  });

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
    const checkButtonFocus = await captureFocusTarget(
      root.getByTestId('button-control')
    );

    expect(await run('focus', '[data-testid="button-control"]')).toBeNull();
    await expect(root.getByTestId('button-control')).toBeFocused();
    await checkButtonFocus();

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
    const checkBeforeFocus = await captureFocusTarget(before);

    await before.focus();
    await expect(before).toBeFocused();
    await checkBeforeFocus();
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
    const checkTriggerFocus = await captureFocusTarget(
      root.locator('[data-slot="tooltip-trigger"]')
    );
    expect(await run<number>('openChanges')).toBe(0);

    expect(await run('focusTrigger')).toBeNull();
    await run('settle');

    const trigger = root.locator('[data-slot="tooltip-trigger"]');
    expect(await run<number>('openChanges')).toBe(1);
    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await expect(trigger).toBeFocused();
    await checkTriggerFocus();
    expect(pageErrors).toEqual([]);
  });

  test('should allow one controlled native-focus request in each focus cycle', async ({
    render,
    run,
  }) => {
    await render('controlledClosed');
    expect(await run<number>('openChanges')).toBe(0);

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
    expect(await run<number>('openChanges')).toBe(0);

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

test('should associate the actual custom content ID in committed markup (Tooltip)', async ({
  render,
  root,
  page,
}) => {
  await render('partIdentityAssociations');
  const trigger = root.locator('[data-slot="tooltip-trigger"]');
  const content = page.locator('[data-slot="tooltip-content"]');
  await expect(content).toHaveAttribute('id', 'caller-tooltip-content');
  await expect(trigger).toHaveAttribute(
    'aria-describedby',
    'caller-tooltip-content'
  );
});
test('should preserve explicit caller ARIA with a custom content ID (Tooltip)', async ({
  render,
  root,
  page,
}) => {
  await render('partIdentityAssociations', { callerAria: true });
  const trigger = root.locator('[data-slot="tooltip-trigger"]');
  const content = page.locator('[data-slot="tooltip-content"]');
  await expect(content).toHaveAttribute('id', 'caller-tooltip-content');
  await expect(trigger).toHaveAttribute(
    'aria-describedby',
    'caller-tooltip-description'
  );
});

for (const callerAria of [false, true]) {
  test(`Tooltip updates reactive part IDs with ${callerAria ? 'explicit caller ARIA' : 'automatic associations'}`, async ({
    render,
    run,
    root,
    page,
  }) => {
    await render('reactivePartIdentityAssociations', { callerAria });
    const trigger = root.locator('[data-slot="tooltip-trigger"]');
    const content = page.locator('[data-slot="tooltip-content"]');
    await expect(content).toHaveAttribute(
      'id',
      'reactive-tooltip-content-initial'
    );
    expect(await run('reads')).toEqual({ content: 1 });
    await expect(trigger).toHaveAttribute(
      'aria-describedby',
      callerAria
        ? 'caller-tooltip-description'
        : 'reactive-tooltip-content-initial'
    );
    await run('update');
    await expect(content).toHaveAttribute(
      'id',
      'reactive-tooltip-content-updated'
    );
    expect(await run('reads')).toEqual({ content: 2 });
    await expect(trigger).toHaveAttribute(
      'aria-describedby',
      callerAria
        ? 'caller-tooltip-description'
        : 'reactive-tooltip-content-updated'
    );
  });
}
