import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../../fixtures';

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** The `<button>` whose trimmed text is exactly `text`, portalled or not. */
function button(page: Page, text: string): Locator {
  return page
    .locator('button')
    .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(text)}\\s*$`) });
}

function focusedText(page: Page) {
  return () => page.evaluate(() => document.activeElement?.textContent?.trim());
}

test.describe('Menubar - Behavior', () => {
  test('should open top-level triggers and nested submenus', async ({
    page,
    render,
  }) => {
    await render('nestedSubmenus');
    const body = page.locator('body');

    await button(page, 'File').click();
    await expect(body).toContainText('New');

    await button(page, 'Share').click();

    await expect(button(page, 'File')).toHaveAttribute('aria-expanded', 'true');
    await expect(body).toContainText('Email');
  });

  test('should mirror submenu open and close keys in RTL', async ({
    page,
    render,
  }) => {
    await render('rtlSubmenu');
    const body = page.locator('body');

    await button(page, 'File').click();
    await expect(button(page, 'Share')).toBeVisible();

    // The keys go to the submenu trigger and then the submenu content, as the
    // vitest original dispatched them, independent of where focus sits.
    await button(page, 'Share').dispatchEvent('keydown', {
      bubbles: true,
      key: 'ArrowLeft',
    });
    await expect(body).toContainText('Email');

    await page
      .locator('[data-slot="menubar-content"]')
      .last()
      .dispatchEvent('keydown', { bubbles: true, key: 'ArrowRight' });
    await expect(body).not.toContainText('Email');
  });

  test('should support keyboard opening and escape dismissal', async ({
    page,
    render,
  }) => {
    await render('keyboardOpen');
    const body = page.locator('body');

    await button(page, 'File').dispatchEvent('keydown', {
      key: 'ArrowDown',
      bubbles: true,
    });
    await expect(body).toContainText('New');

    await page
      .locator('[role="menu"]')
      .dispatchEvent('keydown', { key: 'Escape', bubbles: true });
    await expect(body).not.toContainText('New');
  });

  test('should move actual focus between open menu items with vertical arrows', async ({
    page,
    render,
  }) => {
    await render('verticalArrows');

    await button(page, 'File').click();
    await button(page, 'One').focus();

    await page.keyboard.press('ArrowDown');
    await expect(button(page, 'Three')).toBeFocused();
    await expect(button(page, 'Three')).toHaveAttribute('tabindex', '0');

    await page.keyboard.press('ArrowUp');
    await expect(button(page, 'One')).toBeFocused();
  });

  test('should move focus when a focused root trigger becomes disabled', async ({
    page,
    render,
    run,
  }) => {
    await render('focusedTriggerDisabled');

    await button(page, 'File').focus();
    await run('disableFile');

    await expect(button(page, 'Edit')).toBeFocused();
  });

  test('should support typeahead, activation keys, submenus, and Tab dismissal', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('typeaheadAndSubmenus');
    const focused = focusedText(page);

    await button(page, 'Alpha menu').focus();

    await page.keyboard.press('D');
    await expect.poll(focused).toBe('Primary database menu');

    await page.keyboard.press('d');
    await expect.poll(focused).toBe('Archived database menu');

    await page.keyboard.press('D');
    await expect.poll(focused).toBe('Primary database menu');

    await page.keyboard.press('Enter');
    await expect(page.locator('[data-slot="menubar-content"]')).toHaveCount(1);
    await expect.poll(() => run<number>('openContentItemCount')).toBe(5);
    await expect.poll(focused).toBe('Alpha action');

    await page.keyboard.press('d');
    await expect.poll(focused).toBe('Primary database action');

    await page.keyboard.press('D');
    await expect.poll(focused).toBe('Archived database action');

    await page.keyboard.press('Enter');
    await expect.poll(() => run<number>('archiveActionCount')).toBe(1);

    await button(page, 'Primary database menu').focus();
    await page.keyboard.press(' ');
    await expect(page.locator('[data-slot="menubar-content"]')).toHaveCount(1);

    await page.keyboard.press('t');
    await expect.poll(focused).toBe('Database tools');

    await page.keyboard.press('Enter');
    await expect.poll(focused).toBe('Alpha child action');

    await page.keyboard.press('d');
    await expect.poll(focused).toBe('Primary child action');

    await page.keyboard.press('Tab');

    await expect(button(page, 'Primary database menu')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    await expect(root.getByTestId('after-menubar')).toBeFocused();
  });

  test('should preserve Enter activation for asChild menu and submenu triggers', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('asChildTriggers');
    const file = root.locator('[data-slot="menubar-trigger"]');

    await file.focus();
    await expect(file).toBeFocused();
    await page.keyboard.press('Enter');

    await expect.poll(() => run<number>('filePressCount')).toBe(1);
    await expect(file).toHaveAttribute('aria-expanded', 'true');

    const tools = page.locator('[data-slot="menubar-sub-trigger"]');
    await expect(tools).toHaveCount(1);

    await tools.focus();
    await page.keyboard.press('Enter');

    await expect(page.locator('body')).toContainText('Inspect');
  });

  test('should position open content without shifting document flow', async ({
    page,
    render,
    run,
  }) => {
    await render('positionedContent');

    const beforeHeight = await run<number>('scrollHeight');
    const fileTrigger = button(page, 'File');

    await fileTrigger.click();

    const content = page.locator('[data-slot="menubar-content"]');
    const triggerId = await fileTrigger.getAttribute('id');

    await expect(content).toHaveCount(1);
    await expect(content).toHaveAttribute('data-slot', 'menubar-content');
    await expect(content).toHaveAttribute('aria-labelledby', triggerId ?? '');
    await expect(content).toHaveAttribute('id', /.+/);
    await expect(content).toHaveCSS('position', 'fixed');
    expect(await run<number>('scrollHeight')).toBe(beforeHeight);

    await content.dispatchEvent('keydown', { key: 'Escape', bubbles: true });
    await expect(content).toHaveCount(0);

    await expect(fileTrigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('should reverse top-level trigger navigation under dir="rtl"', async ({
    page,
    render,
  }) => {
    await render('rtlTriggers');

    await button(page, 'File').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(button(page, 'Edit')).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(button(page, 'File')).toBeFocused();
  });
});
