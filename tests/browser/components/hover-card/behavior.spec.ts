import type { Page } from '@playwright/test';

import { expect, test } from '../../fixtures';

const CONTENT = '[data-slot="hover-card-content"]';
const TRIGGER = '[data-slot="hover-card-trigger"]';
const EXIT = '[data-hover-card-pointer-exit]';

const CLOCK_START = new Date('2026-01-01T00:00:00Z');

/**
 * Hover card delays are `setTimeout`s. These specs drive them with Playwright's
 * fake clock, installed and paused before the harness page loads, so a delay
 * elapses only when `page.clock.runFor` advances it, never by wall-clock chance.
 */
async function installClock(page: Page): Promise<void> {
  await page.clock.install({ time: CLOCK_START });
  await page.clock.pauseAt(CLOCK_START);
}

test.describe('HoverCard - Behavior', () => {
  for (const boundary of ['trigger', 'first', 'last']) {
    test(`should preserve ${boundary} focus after an ancestor cancels Tab`, async ({
      page,
      render,
      root,
    }) => {
      await render('ancestorCanceledTab');
      const target =
        boundary === 'trigger'
          ? root.locator(TRIGGER)
          : page.getByTestId(boundary);
      await target.focus();
      await page.keyboard.press(boundary === 'first' ? 'Shift+Tab' : 'Tab');
      await expect(target).toBeFocused();
      await expect(root.locator(TRIGGER)).toHaveAttribute('data-state', 'open');
    });
  }

  test('should keep a disabled asChild trigger closed when programmatically focused', async ({
    page,
    render,
    root,
    run,
  }) => {
    await page.mouse.move(1000, 600);
    await render('disabledFocusTrigger');
    await root.locator(TRIGGER).focus();
    await expect(root.locator(TRIGGER)).toHaveAttribute('data-state', 'closed');
    expect(await run('openChanges')).toEqual([]);
  });

  test('should open and close from hover and focus state changes', async ({
    page,
    render,
    root,
    run,
  }) => {
    await installClock(page);
    await render('hoverAndFocus');
    const trigger = root.locator(TRIGGER);

    await trigger.hover();
    await page.clock.runFor(1);

    await expect(trigger).toHaveAttribute('data-state', 'open');
    await expect(page.locator(CONTENT)).toHaveCount(1);

    await root.locator(EXIT).hover();
    await page.clock.runFor(90);

    await expect(trigger).toHaveAttribute('data-state', 'closed');
    await expect(page.locator(CONTENT)).toHaveCount(0);
    expect(await run<boolean[][]>('openChanges')).toEqual([[true], [false]]);
  });

  test('should support asChild composition and ref forwarding', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('asChildRefs');

    await expect(root.locator('a')).toHaveAttribute(
      'data-slot',
      'hover-card-trigger'
    );
    await expect(page.locator(`section${CONTENT}`)).toHaveAttribute(
      'data-slot',
      'hover-card-content'
    );
    expect(await run('refs')).toEqual({
      triggerIsAnchor: true,
      contentIsSection: true,
    });
  });

  test('should preserve controlled open state given open and onOpenChange when hover and focus events interleave', async ({
    page,
    render,
    root,
    run,
  }) => {
    await installClock(page);
    await render('controlledClosed');

    await run('dispatchFocus');

    expect(await run<boolean[][]>('openChanges')).toContainEqual([true]);
    await expect(root.locator(TRIGGER)).toHaveAttribute('data-state', 'closed');
  });

  test('should cancel delayed close given pointer movement from trigger to content when the close timer is pending', async ({
    page,
    render,
  }) => {
    await installClock(page);
    await render('openWithCloseDelay');
    const content = page.locator(CONTENT);
    await expect(content).toHaveCount(1);

    await content.hover();
    await page.clock.runFor(60);

    await expect(content).toHaveCount(1);
  });

  test('should cancel a pending open when the pointer leaves immediately', async ({
    page,
    render,
    root,
    run,
  }) => {
    await installClock(page);
    await render('immediateLeave');

    await root.locator(TRIGGER).hover();
    await root.locator(EXIT).hover();
    await page.clock.runFor(110);

    await expect(root.locator(TRIGGER)).toHaveAttribute('data-state', 'closed');
    await expect(page.locator(CONTENT)).toHaveCount(0);
    expect(await run<number>('openChanges')).toBe(0);
  });

  test('should cancel the original pending timer after an unrelated re-render', async ({
    page,
    render,
    root,
    run,
  }) => {
    await installClock(page);
    await render('rerenderWhilePending');

    await root.locator(TRIGGER).hover();
    await run('rerender');
    await root.locator(EXIT).hover();
    await page.clock.runFor(110);

    await expect(root.locator(TRIGGER)).toHaveAttribute('data-state', 'closed');
    expect(await run<number>('openChanges')).toBe(0);
  });

  test('should cancel a pending close when the pointer re-enters before its deadline', async ({
    page,
    render,
    root,
  }) => {
    await installClock(page);
    await render('reenterBeforeClose');
    await expect(page.locator(CONTENT)).toHaveCount(1);

    await root.locator(EXIT).hover();
    await page.clock.runFor(40);
    await root.locator(TRIGGER).hover();
    await page.clock.runFor(60);

    await expect(page.locator(CONTENT)).toHaveCount(1);
  });

  test('should honor the final pointer state through repeated timer churn', async ({
    page,
    render,
    root,
    run,
  }) => {
    await installClock(page);
    await render('timerChurn');
    const trigger = root.locator(TRIGGER);
    const exit = root.locator(EXIT);

    for (let cycle = 0; cycle < 3; cycle += 1) {
      await trigger.hover();
      await page.clock.runFor(10);
      await exit.hover();
      await page.clock.runFor(10);
    }
    await trigger.hover();
    await page.clock.runFor(100);

    await expect(page.locator(CONTENT)).toHaveCount(1);
    expect(await run<boolean[][]>('openChanges')).toEqual([[true]]);
  });

  test('should cancel both transition timers during teardown', async ({
    page,
    render,
    root,
    run,
  }) => {
    await installClock(page);
    await render('teardownWithPendingTimers');

    await root.locator(TRIGGER).hover();
    await run('unmount');
    await page.clock.runFor(100);

    expect(await run<number>('openChanges')).toBe(0);
  });

  test('should expose complete dialog labeling given a trigger and content when the card is open', async ({
    page,
    render,
    root,
  }) => {
    await render('openLabeling');
    const triggerId = await root.locator(TRIGGER).getAttribute('id');
    const content = page.locator(CONTENT);

    expect(triggerId).toBeTruthy();
    await expect(content).toHaveAttribute('role', 'dialog');
    await expect(content).toHaveAttribute('aria-labelledby', triggerId!);
  });

  test('should preserve pointer focus and support Tab, Shift+Tab, and Escape across interactive content', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('interactiveContent');
    const before = root.getByTestId('before');
    const trigger = root.locator(TRIGGER);
    const first = page.locator(`${CONTENT} a`);

    await before.focus();
    await trigger.hover();
    await expect(page.locator(CONTENT)).toHaveCount(1);
    await expect(before).toBeFocused();

    await trigger.focus();
    await page.keyboard.press('Tab');
    await expect(first).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(trigger).toBeFocused();

    await run('dispatchTriggerFocus');
    await first.focus();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(page.locator(CONTENT)).toHaveCount(0);
  });

  test('should allow a later focus open when the restoration frame is throttled', async ({
    page,
    render,
    run,
  }) => {
    await render('throttledRestorationFrame');
    await expect(page.locator(CONTENT)).toHaveCount(1);

    try {
      expect(await run<number>('escapeWithThrottledFrames')).toBeGreaterThan(0);
      expect(await run<boolean>('contentOpen')).toBe(false);

      await run('dispatchTriggerFocus');
      expect(await run<boolean>('contentOpen')).toBe(true);
    } finally {
      await run('restoreFrames');
    }
  });
});

for (const part of ['trigger', 'content'] as const) {
  test(`should associate actual custom ${part} IDs in committed markup (HoverCard)`, async ({
    render,
    root,
    page,
  }) => {
    await render('partIdentityAssociations', { part });
    const trigger = root.locator('[data-slot="hover-card-trigger"]');
    const content = page.locator('[data-slot="hover-card-content"]');
    await expect(content).toHaveCount(1);
    await expect(part === 'trigger' ? trigger : content).toHaveAttribute(
      'id',
      `custom-hover-card-${part}`
    );
    const triggerId = await trigger.getAttribute('id');
    const contentId = await content.getAttribute('id');
    expect(triggerId).toBeTruthy();
    expect(contentId).toBeTruthy();
    await expect(trigger).toHaveAttribute('aria-controls', contentId!);
    await expect(content).toHaveAttribute('aria-labelledby', triggerId!);
  });
}
test('should preserve explicit caller ARIA with custom part IDs (HoverCard)', async ({
  render,
  root,
  page,
}) => {
  await render('partIdentityAssociations', { callerAria: true });
  const trigger = root.locator('[data-slot="hover-card-trigger"]');
  const content = page.locator('[data-slot="hover-card-content"]');
  await expect(trigger).toHaveAttribute('id', 'custom-hover-card-trigger');
  await expect(content).toHaveAttribute('id', 'custom-hover-card-content');
  await expect(trigger).toHaveAttribute(
    'aria-controls',
    'caller-hover-card-target'
  );
  await expect(content).toHaveAttribute(
    'aria-labelledby',
    'caller-hover-card-label'
  );
});

for (const callerAria of [false, true]) {
  test(`HoverCard updates reactive part IDs with ${callerAria ? 'explicit caller ARIA' : 'automatic associations'}`, async ({
    render,
    run,
    root,
    page,
  }) => {
    await render('reactivePartIdentityAssociations', { callerAria });
    const trigger = root.locator('[data-slot="hover-card-trigger"]');
    const content = page.locator('[data-slot="hover-card-content"]');
    await expect(trigger).toHaveAttribute(
      'id',
      'reactive-hover-card-trigger-initial'
    );
    await expect(content).toHaveAttribute(
      'id',
      'reactive-hover-card-content-initial'
    );
    expect(await run('reads')).toEqual({ trigger: 1, content: 1 });
    await expect(trigger).toHaveAttribute(
      'aria-controls',
      callerAria
        ? 'caller-hover-card-target'
        : 'reactive-hover-card-content-initial'
    );
    await expect(content).toHaveAttribute(
      'aria-labelledby',
      callerAria
        ? 'caller-hover-card-label'
        : 'reactive-hover-card-trigger-initial'
    );
    await run('update');
    await expect(trigger).toHaveAttribute(
      'id',
      'reactive-hover-card-trigger-updated'
    );
    await expect(content).toHaveAttribute(
      'id',
      'reactive-hover-card-content-updated'
    );
    expect(await run('reads')).toEqual({ trigger: 2, content: 2 });
    await expect(trigger).toHaveAttribute(
      'aria-controls',
      callerAria
        ? 'caller-hover-card-target'
        : 'reactive-hover-card-content-updated'
    );
    await expect(content).toHaveAttribute(
      'aria-labelledby',
      callerAria
        ? 'caller-hover-card-label'
        : 'reactive-hover-card-trigger-updated'
    );
  });
}
