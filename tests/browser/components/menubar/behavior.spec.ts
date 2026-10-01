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
  for (const submenu of [false, true]) {
    for (const callerAria of [false, true]) {
      test(`should ${callerAria ? 'preserve caller ARIA despite' : 'associate'} a custom native trigger ID in ${submenu ? 'submenu' : 'top menu'}`, async ({
        render,
        root,
        page,
        run,
      }) => {
        await render('customTriggerId', { submenu, callerAria });
        await root
          .locator('[data-slot="menubar-trigger"]')
          .dispatchEvent('click');
        const trigger = submenu
          ? page.locator('[data-slot="menubar-sub-trigger"]')
          : root.locator('[data-slot="menubar-trigger"]');
        if (submenu) await trigger.dispatchEvent('click');
        const content = page.locator('[data-slot="menubar-content"]').last();
        await expect(trigger).toHaveAttribute('id', 'caller-menu-trigger');
        await expect(content).toHaveAttribute(
          'aria-labelledby',
          callerAria ? 'caller-owned-label' : 'caller-menu-trigger',
          { timeout: 1000 }
        );
        await run('updateId');
        await expect(trigger).toHaveAttribute('id', 'updated-menu-trigger');
        await expect(content).toHaveAttribute(
          'aria-labelledby',
          callerAria ? 'caller-owned-label' : 'updated-menu-trigger',
          { timeout: 1000 }
        );
      });
    }
  }

  for (const callerAria of [false, true]) {
    test(`should ${callerAria ? 'preserve caller ARIA despite' : 'associate'} a custom native content ID`, async ({
      render,
      root,
      page,
      run,
    }) => {
      await render('customContentId', { callerAria });
      const trigger = root.locator('[data-slot="menubar-trigger"]');
      await trigger.dispatchEvent('click');
      const content = page.locator('[data-slot="menubar-content"]');
      await expect(content).toHaveAttribute('id', 'caller-menubar-content');
      await expect(
        page.getByRole('menuitem', { name: 'One', exact: true })
      ).toBeFocused({ timeout: 1000 });
      await expect(trigger).toHaveAttribute(
        'aria-controls',
        callerAria ? 'caller-owned-controls' : 'caller-menubar-content',
        { timeout: 1000 }
      );
      await run('updateId');
      await expect(content).toHaveAttribute('id', 'updated-menubar-content');
      await expect(trigger).toHaveAttribute(
        'aria-controls',
        callerAria ? 'caller-owned-controls' : 'updated-menubar-content',
        { timeout: 1000 }
      );
    });
  }

  for (const target of ['trigger', 'item', 'subtrigger'] as const) {
    for (const cancel of [false, true]) {
      test(`should ${cancel ? 'suppress' : 'allow'} ${target} default when the caller ${cancel ? 'cancels' : 'observes'} own keydown`, async ({
        page,
        render,
        run,
      }) => {
        await render('ownKeyboardCaller', { target, cancel });
        if (target !== 'trigger')
          await button(page, 'File').dispatchEvent('click');
        const first = button(
          page,
          target === 'trigger' ? 'File' : target === 'item' ? 'One' : 'Share'
        );
        await expect(first).toHaveAttribute('data-caller', 'preserved');
        await first.focus();
        await page.keyboard.press(target === 'trigger' ? 'ArrowDown' : 't');
        if (target === 'trigger')
          await expect(first).toHaveAttribute(
            'aria-expanded',
            cancel ? 'false' : 'true',
            { timeout: 1000 }
          );
        else
          await expect(
            button(page, cancel ? (target === 'item' ? 'One' : 'Share') : 'Two')
          ).toBeFocused({ timeout: 1000 });
        expect(await run<number>('calls')).toBe(1);
      });
    }
  }

  for (const content of [false, true]) {
    test(`should preserve ${content ? 'content' : 'root trigger'} focus when the caller cancels navigation`, async ({
      page,
      render,
      root,
      run,
    }) => {
      await render('callerCancellation', { content });
      if (content) await button(page, 'File').dispatchEvent('click');
      const first = button(page, content ? 'One' : 'File');
      await expect(
        content ? page.getByRole('menu') : root.getByRole('menubar')
      ).toHaveAttribute('data-caller', 'preserved');
      await first.focus();
      await page.keyboard.press(content ? 'ArrowDown' : 'ArrowRight');
      await expect(first).toBeFocused({ timeout: 1000 });
      expect(await run<number>('calls')).toBe(1);
    });
  }

  test('should navigate from a directly focused nested child without closing either menu', async ({
    page,
    render,
  }) => {
    await render('nestedItemFocus');
    await button(page, 'File').dispatchEvent('click');
    await button(page, 'Share').dispatchEvent('click');
    await button(page, 'Chat').focus();
    await page.keyboard.press('ArrowUp');
    await expect(button(page, 'Email')).toBeFocused();
    await expect(button(page, 'File')).toHaveAttribute('aria-expanded', 'true');
    await expect(button(page, 'Share')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
  });

  test('should preserve content focus when an ancestor cancels an orientation arrow', async ({
    page,
    render,
  }) => {
    await render('verticalArrows');
    await button(page, 'File').click();
    const first = button(page, 'One');
    await first.focus();
    await first.evaluate((node: HTMLElement) => {
      node
        .closest('[role="menu"]')!
        .addEventListener('keydown', (event) => event.preventDefault(), {
          capture: true,
          once: true,
        });
    });
    await page.keyboard.press('ArrowDown');
    await expect(first).toBeFocused({ timeout: 1000 });
  });

  test('should preserve root trigger focus when an ancestor cancels an orientation arrow', async ({
    page,
    render,
  }) => {
    await render('rtlTriggers');
    const first = button(page, 'File');
    await first.focus();
    await first.evaluate((node: HTMLElement) => {
      node
        .closest('[role="menubar"]')!
        .addEventListener('keydown', (event) => event.preventDefault(), {
          capture: true,
          once: true,
        });
    });
    await page.keyboard.press('ArrowLeft');
    await expect(first).toBeFocused({ timeout: 1000 });
  });

  for (const action of ['click', 'Enter', 'Space'] as const) {
    test(`should suppress ${action} activation canceled by an ancestor in capture`, async ({
      page,
      render,
      root,
    }) => {
      await render('asChildTriggers');
      const trigger = root.locator('[data-slot="menubar-trigger"]');
      await trigger.focus();
      await trigger.evaluate(
        (node: HTMLElement, eventType: string) => {
          node
            .closest('#mount-root')!
            .addEventListener(eventType, (event) => event.preventDefault(), {
              capture: true,
              once: true,
            });
        },
        action === 'click' ? 'click' : action === 'Enter' ? 'keydown' : 'keyup'
      );
      if (action === 'click') {
        await trigger.evaluate((node: HTMLElement) => node.click());
      } else {
        await page.keyboard.press(action === 'Enter' ? 'Enter' : ' ');
      }
      await expect(trigger).toHaveAttribute('aria-expanded', 'false', {
        timeout: 1000,
      });
    });
  }

  test('should not open a disabled asChild root trigger with ArrowDown', async ({
    page,
    render,
  }) => {
    await render('disabledKeyboardTriggers');
    const trigger = page
      .locator('[data-slot="menubar-trigger"]')
      .filter({ hasText: 'Disabled menu' });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(button(page, 'Disabled action')).toHaveCount(0);
  });

  test('should not open a disabled asChild submenu trigger with the open key', async ({
    page,
    render,
  }) => {
    await render('disabledKeyboardTriggers');
    await button(page, 'Enabled menu').click();
    const trigger = page.locator('[data-slot="menubar-sub-trigger"]');
    await trigger.focus();
    await page.keyboard.press('ArrowRight');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(button(page, 'Disabled child action')).toHaveCount(0);
  });

  test('should navigate from an item focused directly by the caller', async ({
    page,
    render,
  }) => {
    await render('verticalArrows');
    await button(page, 'File').click();
    await button(page, 'Three').focus();
    await page.keyboard.press('ArrowUp');
    await expect(button(page, 'One')).toBeFocused();
    await expect(button(page, 'File')).toHaveAttribute('aria-expanded', 'true');
  });

  test('should navigate from a submenu trigger focused directly by the caller', async ({
    page,
    render,
  }) => {
    await render('nestedSubmenus');
    await button(page, 'File').click();
    await button(page, 'Share').focus();
    await page.keyboard.press('ArrowUp');
    await expect(button(page, 'New')).toBeFocused();
    await expect(button(page, 'Share')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
  });

  test('should open top-level triggers and nested submenus', async ({
    page,
    render,
  }) => {
    await render('nestedSubmenus');
    const body = page.locator('body');

    await button(page, 'File').click();
    await expect(body).toContainText('New');

    await button(page, 'Share').dispatchEvent('click');

    await expect(button(page, 'File')).toHaveAttribute('aria-expanded', 'true');
    await expect(body).toContainText('Email');
  });

  test('should open a submenu on hover and toggle it closed on a pure press', async ({
    page,
    render,
  }) => {
    await render('nestedSubmenus');
    await button(page, 'File').click();
    const share = button(page, 'Share');
    await share.hover();
    await expect(share).toHaveAttribute('aria-expanded', 'true');
    await expect(button(page, 'Email')).toBeVisible();
    await share.dispatchEvent('click');
    await expect(share).toHaveAttribute('aria-expanded', 'false');
    await expect(button(page, 'Email')).toHaveCount(0);
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
