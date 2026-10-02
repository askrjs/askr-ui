import { captureFocusTarget } from '../../assertions';
import { expect, test } from '../../fixtures';

test.describe('Menu - Behavior', () => {
  for (const cancel of [false, true]) {
    test(`should ${cancel ? 'suppress' : 'allow'} typeahead when the caller ${cancel ? 'cancels' : 'observes'} own item keydown`, async ({
      page,
      render,
      root,
      run,
    }) => {
      await render('ownKeyboardCaller', { cancel });
      const first = root.getByRole('menuitem', { name: 'One', exact: true });
      await expect(first).toHaveAttribute('data-caller', 'preserved');
      await first.focus();
      await page.keyboard.press('t');
      await expect(
        root.getByRole('menuitem', {
          name: cancel ? 'One' : 'Two',
          exact: true,
        })
      ).toBeFocused({ timeout: 1000 });
      expect(await run<number>('calls')).toBe(1);
    });
  }

  test('should preserve item focus when the caller cancels navigation', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('callerCancellation');
    const first = root.getByRole('menuitem', { name: 'One', exact: true });
    await expect(root.getByRole('menu')).toHaveAttribute(
      'data-caller',
      'preserved'
    );
    await first.focus();
    await page.keyboard.press('ArrowDown');
    await expect(first).toBeFocused({ timeout: 1000 });
    expect(await run<number>('calls')).toBe(1);
  });

  for (const key of ['ArrowDown', 'End']) {
    test(`should preserve item focus when an ancestor cancels ${key}`, async ({
      page,
      render,
      root,
    }) => {
      await render('verticalArrows');
      const first = root.getByRole('menuitem', { name: 'One', exact: true });
      await first.focus();
      await first.evaluate((node: HTMLElement) => {
        node
          .closest('[role="menu"]')!
          .addEventListener('keydown', (event) => event.preventDefault(), {
            capture: true,
            once: true,
          });
      });
      await page.keyboard.press(key);
      await expect(first).toBeFocused({ timeout: 1000 });
    });
  }

  test('should navigate from an item focused directly by the caller', async ({
    page,
    render,
    root,
  }) => {
    await render('verticalArrows');
    const items = root.getByRole('menuitem');
    await items.nth(2).focus();
    await page.keyboard.press('ArrowUp');
    await expect(items.nth(0)).toBeFocused();
    await expect(items.nth(0)).toHaveAttribute('tabindex', '0');
    await expect(items.nth(2)).toHaveAttribute('tabindex', '-1');
  });

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
    const checkFirstLinkFocus = await captureFocusTarget(links.nth(0));
    const checkSecondLinkFocus = await captureFocusTarget(links.nth(1));

    await links.nth(0).focus();
    await page.keyboard.press('ArrowDown');
    await expect(links.nth(1)).toBeFocused();
    await checkSecondLinkFocus();
    await page.keyboard.press('a');
    await expect(links.nth(0)).toBeFocused();
    await checkFirstLinkFocus();
    await page.keyboard.press('End');
    await expect(links.nth(1)).toBeFocused();
    await checkSecondLinkFocus();
    await page.keyboard.press('Home');
    await expect(links.nth(0)).toBeFocused();
    await checkFirstLinkFocus();
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
    const checkFirstItemFocus = await captureFocusTarget(items.nth(0));
    const checkThirdItemFocus = await captureFocusTarget(items.nth(2));

    await items.nth(0).focus();
    await page.keyboard.press('ArrowDown');

    await expect(items.nth(2)).toBeFocused();
    await checkThirdItemFocus();
    await expect(items.nth(2)).toHaveAttribute('tabindex', '0');
    await expect(items.nth(2)).toHaveAttribute('data-roving-index', '2');

    await page.keyboard.press('ArrowUp');
    await expect(items.nth(0)).toBeFocused();
    await checkFirstItemFocus();
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
    const checkFirstItemFocus = await captureFocusTarget(items.nth(0));
    const checkSecondItemFocus = await captureFocusTarget(items.nth(1));

    await items.nth(0).focus();
    await page.keyboard.press('ArrowLeft');
    await expect(items.nth(1)).toBeFocused();
    await checkSecondItemFocus();

    await page.keyboard.press('ArrowRight');
    await expect(items.nth(0)).toBeFocused();
    await checkFirstItemFocus();
  });
});
