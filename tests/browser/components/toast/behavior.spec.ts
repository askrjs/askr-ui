import type { Page } from '@playwright/test';

import { expect, test } from '../../fixtures';

const TOAST = '[data-toast="true"]';
const CLOCK_START = new Date('2026-01-01T00:00:00Z');

/**
 * Toast dismissal is a `setTimeout` against `Date.now()`. Specs that time it
 * install Playwright's fake clock paused before the harness page loads, so the
 * duration elapses only when `page.clock.runFor` advances it.
 */
async function installPausedClock(page: Page): Promise<void> {
  await page.clock.install({ time: CLOCK_START });
  await page.clock.pauseAt(CLOCK_START);
}

test.describe('Toast - Behavior', () => {
  test('should coexist with a default Portal without scheduling an update loop', async ({
    render,
    run,
  }) => {
    await render('withDefaultPortal');
    await run('settle');
    await run('settle');

    expect(await run<string>('bodyText')).toContain('Portaled content');
    expect(await run<boolean>('hasToast')).toBe(false);
  });

  test('should render toast content inside the viewport in declaration order', async ({
    render,
    root,
  }) => {
    await render('declarationOrder');

    await expect(root.locator('[data-toast-title="true"]')).toHaveText([
      'First',
      'Second',
    ]);
  });

  test('should keep an infinite-duration toast open without scheduling overflow', async ({
    page,
    render,
    root,
  }) => {
    await installPausedClock(page);
    await render('infiniteDuration');
    await expect(root.locator(TOAST)).toHaveCount(1);

    await page.clock.runFor('24:00:00');

    await expect(root.locator(TOAST)).toHaveCount(1);
  });

  test('should pause and resume the remaining dismiss duration while hovered', async ({
    page,
    render,
    root,
    run,
  }) => {
    await installPausedClock(page);
    await render('hoverTimed');
    const toast = root.locator(TOAST);
    await expect(toast).toHaveCount(1);
    expect(await run<boolean>('markToast')).toBe(true);

    await page.clock.runFor(100);
    await toast.hover();
    await page.clock.runFor(1000);
    expect(await run<boolean>('isMarkedToast')).toBe(true);

    await page.mouse.move(1270, 890);
    await page.clock.runFor(800);
    await expect(toast).toHaveCount(0);
  });

  test('should pause until focus leaves the toast subtree', async ({
    page,
    render,
    root,
    run,
  }) => {
    await installPausedClock(page);
    await render('focusTimed');
    const toast = root.locator(TOAST);
    await expect(toast).toHaveCount(1);
    expect(await run<boolean>('markToast')).toBe(true);

    await page.clock.runFor(100);
    await toast.locator('button').focus();
    await page.clock.runFor(1000);
    expect(await run<boolean>('isMarkedToast')).toBe(true);

    await root.locator('#outside').focus();
    await page.clock.runFor(800);
    await expect(toast).toHaveCount(0);
  });

  test('should preserve an unrelated paused toast through sibling registration changes', async ({
    page,
    render,
    root,
    run,
  }) => {
    await installPausedClock(page);
    await render('siblingRegistration');
    const original = '#original-toast';
    const originalClose = root.locator(`${original} button`);
    await expect(root.locator(original)).toHaveCount(1);
    expect(await run<boolean>('markToast', original)).toBe(true);
    await originalClose.focus();

    await page.clock.runFor(60);
    await run('click', '#open-sibling-toast');

    expect(await run<boolean>('isMarkedToast', original)).toBe(true);
    await expect(originalClose).toBeFocused();
    await expect(root.locator('#sibling-toast')).toHaveCount(1);

    await page.clock.runFor(5);
    await run('click', '#open-sibling-toast');

    expect(await run<boolean>('isMarkedToast', original)).toBe(true);
    await expect(originalClose).toBeFocused();
    await expect(root.locator('#sibling-toast')).toHaveCount(0);

    await page.clock.runFor(40);
    expect(await run<boolean>('isMarkedToast', original)).toBe(true);

    await root.locator('#open-sibling-toast').focus();
    await page.clock.runFor(100);
    await expect(root.locator(original)).toHaveCount(0);
  });

  test('should restore focus after closing a controlled toast', async ({
    render,
    root,
  }) => {
    await render('controlledToast');
    const launcher = root.locator('#launcher');

    await launcher.focus();
    await expect(root.locator(TOAST)).toHaveCount(1);

    const close = root.locator('[data-toast-close="true"]');
    await close.focus();
    await expect(close).toBeFocused();
    await close.press('Enter');

    await expect(launcher).toBeFocused();
  });

  test('should not steal focus when focus moved outside a closing toast', async ({
    render,
    root,
    run,
  }) => {
    await render('controlledToast');
    const launcher = root.locator('#launcher');
    const elsewhere = root.locator('#elsewhere');

    await launcher.focus();
    await expect(root.locator(TOAST)).toHaveCount(1);

    await elsewhere.focus();
    // A programmatic click leaves focus where it is, which is the point here.
    await run('click', '[data-toast-close="true"]');

    await expect(root.locator(TOAST)).toHaveCount(0);
    await expect(elsewhere).toBeFocused();
  });

  test('should open a controlled toast from a user action without locking the page', async ({
    render,
    root,
  }) => {
    await render('controlledOpener');

    await root.locator('#open-toast').click();

    await expect(root.locator(TOAST)).toHaveCount(1);
    const action = root.locator('[data-toast-action="true"]');
    expect(await action.evaluate((node) => node.tagName)).toBe('A');
    await expect(action).toHaveAttribute('href', '/logs');
  });

  test('should open a controlled toast with a link action without locking the page', async ({
    render,
    root,
  }) => {
    await render('controlledLinkAction');

    await root.locator('#open-link-toast').click();

    await expect(root.locator(TOAST)).toHaveCount(1);
    const action = root.locator('[data-toast-action="true"]');
    expect(await action.evaluate((node) => node.tagName)).toBe('A');
    await expect(action).toHaveAttribute('href', '/logs');
  });

  test('should open a controlled toast from a press button without locking the page', async ({
    render,
    root,
  }) => {
    await render('controlledPressButton');
    const launcher = root.locator('#open-press-toast');

    await launcher.focus();
    await launcher.click();

    await expect(root.locator(TOAST)).toHaveCount(1);
  });

  test('should dismiss on escape and action press', async ({
    render,
    root,
  }) => {
    await render('undoable');
    await expect(root.locator(TOAST)).toHaveCount(1);

    await root
      .locator(TOAST)
      .dispatchEvent('keydown', { key: 'Escape', bubbles: true });
    await expect(root.locator(TOAST)).toHaveCount(0);

    await render('undoable');
    await expect(root.locator(TOAST)).toHaveCount(1);

    await root.locator('[data-toast-action="true"]').click();
    await expect(root.locator(TOAST)).toHaveCount(0);
  });

  test('should dismiss asChild actions and close controls with Enter and Space', async ({
    page,
    render,
    root,
  }) => {
    await render('asChildAction');
    const action = root.locator('[data-toast-action="true"]');

    await action.focus();
    await expect(action).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(root.locator(TOAST)).toHaveCount(0);

    await render('asChildClose');
    const close = root.locator('[data-toast-close="true"]');

    await close.focus();
    await expect(close).toBeFocused();
    await page.keyboard.press(' ');
    await expect(root.locator(TOAST)).toHaveCount(0);
  });

  test('should preserve action styling and href when composed with a link child', async ({
    render,
    root,
  }) => {
    await render('linkAction');
    const action = root.locator('[data-toast-action="true"]');

    await expect(action).toHaveAttribute('data-slot', 'toast-action');
    expect(await action.evaluate((node) => node.tagName)).toBe('A');
    await expect(action).toHaveAttribute('href', '/logs');
  });
});
