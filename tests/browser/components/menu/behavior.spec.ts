import { expect, test } from '../../fixtures';

test.describe('Menu - Behavior', () => {
  test('should render menu semantics with a single tab stop', async ({
    render,
    root,
  }) => {
    await render('singleTabStop');
    const items = root.getByRole('menuitem');

    await expect(items.nth(0)).toHaveAttribute('tabindex', '0');
    await expect(items.nth(1)).toHaveAttribute('tabindex', '-1');
  });

  test('should support standalone navigation links with structured item content', async ({
    page,
    render,
    root,
  }) => {
    await render('navigationLinks');
    const links = root.locator('a');

    await links.nth(0).focus();
    await page.keyboard.press('ArrowDown');
    await expect(links.nth(1)).toBeFocused();
    await page.keyboard.press('a');
    await expect(links.nth(0)).toBeFocused();
    await page.keyboard.press('End');
    await expect(links.nth(1)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(links.nth(0)).toBeFocused();
    expect(
      await links
        .nth(0)
        .locator('[data-slot="menu-item-description"]')
        .textContent()
    ).toBe('Production workspace');
  });

  test('should support nested menu item composition without direct child injection', async ({
    render,
    root,
  }) => {
    await render('nestedComposition');
    const items = root.getByRole('menuitem');

    await expect(items.nth(0)).toHaveAttribute('tabindex', '0');
    await expect(items.nth(1)).toHaveAttribute('tabindex', '-1');
  });

  test('should support typeahead, activation keys, and a single Tab stop', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('typeaheadAndActivation');
    const focusedText = () =>
      page.evaluate(() => document.activeElement?.textContent?.trim());

    await root.getByRole('menuitem', { name: 'Alpha', exact: true }).focus();

    await page.keyboard.press('D');
    await expect.poll(focusedText).toBe('Primary database');

    await page.keyboard.press('d');
    await expect.poll(focusedText).toBe('Archived database');

    await page.keyboard.press('Enter');
    await page.keyboard.press(' ');
    await expect.poll(() => run<number>('archiveSelectCount')).toBe(2);

    await page.keyboard.press('Tab');
    await expect(root.getByTestId('after-menu')).toBeFocused();
  });

  test('should move actual focus with vertical arrow keys', async ({
    page,
    render,
    root,
  }) => {
    await render('verticalArrows');
    const items = root.getByRole('menuitem');

    await items.nth(0).focus();
    await page.keyboard.press('ArrowDown');

    await expect(items.nth(2)).toBeFocused();
    await expect(items.nth(2)).toHaveAttribute('tabindex', '0');
    await expect(items.nth(2)).toHaveAttribute('data-roving-index', '2');

    await page.keyboard.press('ArrowUp');
    await expect(items.nth(0)).toBeFocused();
  });

  test('should move focus when the focused item becomes disabled', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('focusedItemDisabled');

    await root.getByRole('menuitem', { name: 'Two', exact: true }).focus();
    await run('disableTwo');

    await expect
      .poll(() => page.evaluate(() => document.activeElement?.textContent))
      .toBe('Three');
  });

  test('should reverse horizontal arrow navigation under dir="rtl"', async ({
    page,
    render,
    root,
  }) => {
    await render('rtlHorizontal');
    const items = root.getByRole('menuitem');

    await items.nth(0).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(items.nth(1)).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(items.nth(0)).toBeFocused();
  });
});
