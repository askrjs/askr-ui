import type { Page } from '@playwright/test';

import { expect, test } from '../../fixtures';

/** Trimmed text of the focused element; dropdown content is portalled. */
function focusedText(page: Page) {
  return () => page.evaluate(() => document.activeElement?.textContent?.trim());
}

test.describe('Dropdown - Behavior', () => {
  test('should toggle trigger expansion state when activated', async ({
    render,
    root,
  }) => {
    await render('toggleExpansion');
    const trigger = root.locator('[aria-haspopup="menu"]');

    await trigger.evaluate((node: HTMLElement) => node.click());
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await trigger.evaluate((node: HTMLElement) => node.click());
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('should focus the first item when pointer activation mounts content', async ({
    page,
    render,
    root,
  }) => {
    await render('toggleExpansion');

    await root.locator('[aria-haspopup="menu"]').click();

    await expect
      .poll(() => page.evaluate(() => document.activeElement?.textContent))
      .toBe('Archive');
  });

  test('should move focus when the focused item becomes disabled', async ({
    page,
    render,
    run,
  }) => {
    await render('focusedItemDisabled');
    const activeText = () =>
      page.evaluate(() => document.activeElement?.textContent);

    await expect.poll(activeText).toBe('Archive');

    await run('disableArchive');

    await expect.poll(activeText).toBe('Delete');
  });

  test('should render typed trigger and item variants for themed menus', async ({
    page,
    render,
    root,
  }) => {
    await render('themedVariants');
    const trigger = root.locator('[aria-haspopup="menu"]');
    const item = page.locator('[role="menuitem"]');

    await expect(trigger).toHaveAttribute('data-variant', 'ghost');
    await expect(trigger).toHaveAttribute('data-size', 'icon');
    expect(await item.evaluate((node) => node.tagName)).toBe('A');
    await expect(item).toHaveAttribute('data-slot', 'dropdown-item');
    await expect(item).toHaveAttribute('data-variant', 'destructive');
  });

  test('should support nested dropdown item composition without direct child injection', async ({
    page,
    render,
  }) => {
    await render('nestedComposition');
    const items = page.locator('[role="menuitem"]');

    await expect(items).toHaveCount(2);
    await expect(items.nth(0)).toHaveAttribute('tabindex', '0');
    await expect(items.nth(1)).toHaveAttribute('tabindex', '-1');
  });

  test('should keep dropdown open when all items are disabled and arrow navigation is attempted', async ({
    page,
    render,
    root,
  }) => {
    await render('allItemsDisabled');

    // Every item is disabled, so none can take focus for a real key press;
    // the keydown goes to the content element as the vitest original sent it.
    await page
      .locator('[data-slot="dropdown-content"]')
      .dispatchEvent('keydown', { key: 'ArrowDown', bubbles: true });

    const trigger = root.locator('[aria-haspopup="menu"]');
    const items = page.locator('[role="menuitem"]');

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(items).toHaveCount(2);
    for (const item of await items.all()) {
      await expect(item).toHaveAttribute('tabindex', '-1');
      await expect(item).toHaveAttribute('aria-disabled', 'true');
    }
  });

  test('should support menu-button opening, typeahead, activation, and Tab dismissal', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('menuButton');
    const trigger = root.locator('[data-slot="dropdown-trigger"]');

    await trigger.focus();
    await page.keyboard.press('ArrowDown');

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(focusedText(page)).toBe('Alpha');

    await page.keyboard.press('D');
    await expect.poll(focusedText(page)).toBe('Primary database');

    await page.keyboard.press('d');
    await expect.poll(focusedText(page)).toBe('Archived database');

    await page.keyboard.press('Enter');
    await expect.poll(() => run<number>('archiveSelectCount')).toBe(1);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.focus();
    await page.keyboard.press(' ');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Tab');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(root.getByTestId('after-dropdown')).toBeFocused();
  });

  test('should activate an asChild item with Space', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('asChildSpace');

    await page.locator('[data-slot="dropdown-item"]').focus();
    await page.keyboard.press(' ');

    await expect.poll(() => run<number>('selectCount')).toBe(1);
    await expect(
      root.locator('[data-slot="dropdown-trigger"]')
    ).toHaveAttribute('aria-expanded', 'false');
  });

  test('should throw when DropdownContent is used without Dropdown', async ({
    render,
    run,
  }) => {
    await render('orphanContent');

    expect(await run<string>('message')).toContain(
      'Dropdown components must be used within <Dropdown>'
    );
  });

  test('should allow DropdownItem when used within Dropdown', async ({
    page,
    render,
  }) => {
    await render('itemWithinDropdown');

    await expect(page.locator('[role="menuitem"]')).toHaveText('Orphan');
  });

  test('should throw when DropdownTrigger is used without Dropdown', async ({
    render,
    run,
  }) => {
    await render('orphanTrigger');

    expect(await run<string>('message')).toContain(
      'Dropdown components must be used within <Dropdown>'
    );
  });

  test('should keep vertical item navigation stable under dir="rtl"', async ({
    page,
    render,
  }) => {
    await render('rtlVertical');

    await page.getByRole('menuitem', { name: 'Archive' }).focus();
    await page.keyboard.press('ArrowDown');
    await expect.poll(focusedText(page)).toBe('Duplicate');

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(focusedText(page)).toBe('Duplicate');
  });
});
