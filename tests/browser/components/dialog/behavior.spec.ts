import type { Locator } from '@playwright/test';

import { expect, test } from '../../fixtures';

function zIndex(locator: Locator): Promise<number> {
  return locator.evaluate((node) => Number(getComputedStyle(node).zIndex));
}

test.describe('Dialog - Behavior', () => {
  test('should preserve the open portal subtree through controlled input updates', async ({
    page,
    render,
  }) => {
    await render('controlledInput');
    const dialog = page.locator('[data-slot="dialog-content"]');
    const input = page.locator('input[aria-label="Name"]');
    await expect(input).toHaveValue('Ada');
    const dialogId = await dialog.getAttribute('id');

    await input.fill('Grace');

    await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveCount(1);
    await expect(dialog).toHaveCount(1);
    await expect(input).toHaveCount(1);
    await expect(input).toHaveValue('Grace');
    expect(await dialog.getAttribute('id')).toBe(dialogId);
  });

  test('should keep portals isolated when separate renders reuse the same public id', async ({
    page,
    render,
    run,
  }) => {
    await render('sharedPublicId');
    const dialogs = page.locator('[data-slot="dialog-content"]');

    await expect(dialogs).toHaveCount(2);
    await expect(dialogs).toHaveText(['First dialog', 'Second dialog']);

    await run('remount');

    await expect(dialogs).toHaveCount(2);
    await expect(dialogs).toHaveText(['First dialog', 'Second dialog']);
  });

  test('should toggle trigger expansion state when activated', async ({
    render,
    root,
  }) => {
    await render('triggered');
    const trigger = root.locator('[aria-haspopup="dialog"]');

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // A real press on the trigger also lands outside the open content, so it
    // would exercise outside-press dismissal first. This case is about
    // activating the trigger itself while open, so dispatch only the click.
    await trigger.dispatchEvent('click');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('should preserve button styling props when trigger and close compose as children', async ({
    page,
    render,
    root,
  }) => {
    await render('composedButtons');
    const trigger = root.locator('[aria-haspopup="dialog"]');

    await expect(trigger).toHaveAttribute('data-slot', 'button');
    await expect(trigger).toHaveAttribute('data-dialog-trigger', 'true');
    await expect(trigger).toHaveAttribute('data-variant', 'outline');

    await trigger.click();

    const close = page.locator('[data-dialog-close="true"]');
    await expect(close).toHaveAttribute('data-slot', 'button');
    await expect(close).toHaveAttribute('data-variant', 'outline');

    await close.click();

    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(0);
  });

  test('should open and close through asChild Enter and Space presses', async ({
    page,
    render,
    root,
  }) => {
    await render('asChildControls');
    const trigger = root.locator('[data-slot="dialog-trigger"]');

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.locator('[data-slot="dialog-close"]').focus();
    await page.keyboard.press(' ');

    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(0);
  });

  test('should omit generated title and description references when those parts are absent', async ({
    page,
    render,
  }) => {
    await render('labelledWithoutParts');
    const content = page.locator('[role="dialog"]').filter({ hasText: 'Body' });

    await expect(content).toHaveAttribute('aria-label', 'Preferences');
    await expect(content).not.toHaveAttribute('aria-labelledby');
    await expect(content).not.toHaveAttribute('aria-describedby');
  });

  test('should keep dialog open when DialogContent onDismiss is provided and handle Escape', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('contentOnDismiss');
    const content = page
      .locator('[data-slot="dialog-content"]')
      .filter({ hasText: 'Body' });
    await expect(content).toHaveCount(1);

    await page.keyboard.press('Escape');

    await expect.poll(() => run<number>('dismissCount')).toBe(1);
    await expect(root.locator('[data-slot="dialog-trigger"]')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(1);
  });

  test('should keep centered dialog content within viewport padding on narrow viewports', async ({
    page,
    render,
    root,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await render('narrowViewport');

    await root.locator('[aria-haspopup="dialog"]').click();

    const content = page
      .locator('[data-slot="dialog-content"]')
      .filter({ hasText: 'Body' });
    await expect(content).toHaveCSS('left', '20px');
    await expect(content).toHaveCSS('top', '20px');
    await expect(content).toHaveCSS('max-width', '350px');
    await expect(content).toHaveCSS('max-height', '804px');
  });

  test('should keep modal dismissal and nested overlay stacking correct with other families', async ({
    page,
    render,
    root,
  }) => {
    await render('modalWithOtherFamilies');
    const dialog = page.locator('[data-slot="dialog-content"]');
    const select = page.locator('[data-slot="select-content"]');
    await expect(dialog).toHaveCount(1);
    await expect(select).toHaveCount(1);

    expect(await zIndex(select)).toBeGreaterThan(await zIndex(dialog));

    await page.getByRole('option', { name: 'One', exact: true }).click();

    // The headless overlay has no box without theme CSS, so a real pointer
    // cannot hit it; dispatch the press on the overlay element directly.
    await page
      .locator('[data-slot="dialog-overlay"]')
      .dispatchEvent('pointerdown', { bubbles: true, cancelable: true });

    await expect(dialog).toHaveCount(0);
    await expect(root.locator('[data-slot="toast"]')).toHaveCount(1);
  });

  test('should let a nested dropdown own focus and restore it inside the dialog', async ({
    page,
    render,
  }) => {
    await render('nestedDropdown');
    const trigger = page.locator('[data-slot="dropdown-trigger"]');

    await trigger.click();

    const content = page.locator('[data-slot="dropdown-content"]');
    await expect(content.locator('[data-slot="dropdown-item"]')).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(trigger).toBeFocused();
    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(1);
  });

  test('should stack a later dialog and its backdrop above an already-open select', async ({
    page,
    render,
  }) => {
    await render('laterDialogOverSelect');

    await page.getByRole('option', { name: 'Open second dialog' }).click();

    const select = page.locator('[data-slot="select-content"]');
    const secondDialog = page
      .locator('[data-slot="dialog-content"]')
      .filter({ hasText: /^Second dialog$/ });
    const secondOverlay = page.locator('[data-second-overlay="true"]');
    await expect(secondDialog).toHaveCount(1);

    await expect(secondOverlay).toHaveAttribute('data-askr-overlay-stack-id');
    const selectZIndex = await zIndex(select);
    expect(await zIndex(secondOverlay)).toBeGreaterThan(selectZIndex);
    expect(await zIndex(secondDialog)).toBeGreaterThan(
      await zIndex(secondOverlay)
    );
  });
});
