import type { Page } from '@playwright/test';

import { expect, test } from '../../fixtures';

/** Trimmed text of the focused element; select content is portalled. */
function focusedText(page: Page) {
  return () => page.evaluate(() => document.activeElement?.textContent?.trim());
}

test.describe('Select - Behavior', () => {
  for (const openMethod of ['pointer', 'keyboard'] as const) {
    test(`should restore trigger focus after a viewport resize when opened by ${openMethod}`, async ({
      page,
      render,
      root,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await render('viewportResize');
      const trigger = root.locator('[aria-haspopup="listbox"]');

      await trigger.focus();
      if (openMethod === 'pointer') {
        await trigger.click();
      } else {
        await page.keyboard.press('ArrowDown');
      }
      const content = page.locator('[data-slot="select-content"]');
      await expect(content).toBeVisible();

      await page.setViewportSize({ width: 320, height: 568 });

      await expect
        .poll(async () => (await content.boundingBox())?.x ?? -1)
        .toBeGreaterThanOrEqual(0);
      await expect
        .poll(async () => {
          const box = await content.boundingBox();
          return box ? box.x + box.width : Infinity;
        })
        .toBeLessThanOrEqual(320);

      await content.dispatchEvent('keydown', { key: 'Escape', bubbles: true });

      await expect(trigger).toBeFocused();
    });
  }

  test('should wire the hidden input and trigger expansion state', async ({
    render,
    root,
  }) => {
    await render('hiddenInput');
    const trigger = root.locator('[aria-haspopup="listbox"]');
    const input = root.locator('input[type="hidden"]');

    await expect(input).toHaveValue('askr');
    await expect(trigger).toContainText('Askr');

    await trigger.evaluate((node: HTMLElement) => node.click());
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('should render typed trigger size for themed select controls', async ({
    render,
    root,
  }) => {
    await render('triggerSize');

    await expect(root.locator('[aria-haspopup="listbox"]')).toHaveAttribute(
      'data-size',
      'sm'
    );
  });

  test('should apply root disabled semantics to the trigger and hidden input', async ({
    render,
    root,
  }) => {
    await render('rootDisabled');
    const trigger = root.locator('[aria-haspopup="listbox"]');
    const input = root.locator('input[type="hidden"]');

    await expect(trigger).toBeDisabled();
    await expect(trigger).toHaveAttribute('data-disabled', 'true');
    await expect(input).toBeDisabled();

    // A programmatic `.click()`, as the vitest original used: Playwright's
    // `locator.click()` would wait for the button to become enabled instead.
    await trigger.evaluate((node: HTMLElement) => node.click());

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('should move focus when the focused option becomes disabled', async ({
    page,
    render,
    run,
  }) => {
    await render('focusedOptionDisabled');
    const activeText = () =>
      page.evaluate(() => document.activeElement?.textContent);

    await expect.poll(activeText).toBe('Askr');

    await run('disableAskr');

    await expect.poll(activeText).toBe('Solid');
  });

  test('should use explicit item text values for trigger rendering', async ({
    render,
    root,
  }) => {
    await render('explicitTextValue');

    expect(await root.locator('[aria-haspopup="listbox"]').textContent()).toBe(
      'Askr'
    );
  });

  test('should label select groups through nested SelectLabel parts', async ({
    page,
    render,
  }) => {
    await render('labelledGroup');
    const group = page.locator('[role="group"]').first();
    const label = group.locator('[data-select-label="true"]');

    await expect(label).toHaveAttribute('id', /.+/);
    const labelId = await label.getAttribute('id');
    await expect(group).toHaveAttribute('aria-labelledby', labelId ?? '');
  });

  test('should update hidden input and close content when an enabled item is selected', async ({
    page,
    render,
    root,
  }) => {
    await render('hiddenInput');
    const trigger = root.locator('[aria-haspopup="listbox"]');

    await trigger.evaluate((node: HTMLElement) => node.click());
    await page
      .locator('[data-slot="select-item"]')
      .filter({ hasText: /^\s*Solid\s*$/ })
      .evaluate((node: HTMLElement) => node.click());

    await expect(root.locator('input[type="hidden"]')).toHaveValue('solid');
    await expect(trigger).toContainText('Solid');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('should not change value when clicking a disabled item', async ({
    page,
    render,
    root,
  }) => {
    await render('disabledItem');
    const trigger = root.locator('[aria-haspopup="listbox"]');

    await trigger.evaluate((node: HTMLElement) => node.click());
    const disabledItem = page
      .locator('[data-slot="select-item"]')
      .filter({ hasText: /^\s*Solid\s*$/ });

    await expect(disabledItem).toHaveAttribute('aria-disabled', 'true');
    await disabledItem.evaluate((node: HTMLElement) => node.click());

    await expect(root.locator('input[type="hidden"]')).toHaveValue('askr');
    await expect(trigger).toContainText('Askr');
  });

  test('should keep all disabled select items unfocusable when navigation is attempted', async ({
    page,
    render,
  }) => {
    await render('allItemsDisabled');
    const items = page.locator('[role="option"]');

    await expect(items).toHaveCount(2);
    for (const item of await items.all()) {
      await expect(item).toHaveAttribute('tabindex', '-1');
    }
  });

  test('should support buffered typeahead from the trigger and listbox focus', async ({
    page,
    render,
    root,
    run,
  }) => {
    // The fake clock replaces vi.useFakeTimers: it is paused so the typeahead
    // buffer only expires when the test advances time past its 500ms reset.
    await page.clock.install();
    await render('bufferedTypeahead');
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1_000);
    const focused = focusedText(page);
    const trigger = root.locator('[data-slot="select-trigger"]');

    await trigger.focus();
    for (const key of 'database2') await page.keyboard.press(key);

    await expect(root.locator('input[name="database"]')).toHaveValue(
      'database-2'
    );
    await expect(trigger).toBeFocused();

    await trigger.evaluate((node: HTMLElement) => node.click());
    const content = page.locator('[data-slot="select-content"]');
    await expect(content).toHaveCount(1);
    await content.focus();

    await page.keyboard.press('D');

    expect(await run<boolean>('lastKeydownPrevented')).toBe(true);
    await expect.poll(focused).toBe('Archived database');

    await page.keyboard.press('d');
    await expect.poll(focused).toBe('Delta');

    await page.clock.runFor(600);
    await page.keyboard.press('a');
    await expect.poll(focused).toBe('Alpha');

    await page.clock.runFor(600);
    await page.keyboard.type('database archive');

    await expect.poll(focused).toBe('Archived database');
    await run('stopRecording');
  });

  test('should keep arrow, Space, Enter, and Tab interactions intuitive', async ({
    page,
    render,
    root,
  }) => {
    await render('arrowSpaceEnterTab');
    const trigger = root.locator('[data-slot="select-trigger"]');
    const focused = focusedText(page);

    await trigger.focus();
    await page.keyboard.press('ArrowDown');

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(focused).toBe('Alpha');

    await page.keyboard.press('ArrowDown');
    await expect.poll(focused).toBe('Beta');

    await page.keyboard.press(' ');

    await expect(root.locator('input[name="framework"]')).toHaveValue('beta');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('should open with Space and move past the popup with Tab', async ({
    page,
    render,
    root,
  }) => {
    await render('spaceThenTab');
    const trigger = root.locator('[data-slot="select-trigger"]');

    await trigger.focus();
    await page.keyboard.press(' ');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Tab');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(root.getByTestId('after-select')).toBeFocused();
  });

  test('should open an asChild trigger with Enter', async ({
    page,
    render,
    root,
  }) => {
    await render('asChildTrigger');
    const trigger = root.locator('[data-slot="select-trigger"]');

    await trigger.focus();
    await page.keyboard.press('Enter');

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(focusedText(page)).toBe('Alpha');
  });

  test('should throw when SelectContent is used without Select', async ({
    render,
    run,
  }) => {
    await render('orphanContent');

    expect(await run<string>('message')).toContain(
      'Select components must be used within <Select>'
    );
  });

  test('should allow SelectItem when used within Select', async ({
    page,
    render,
  }) => {
    await render('itemWithinSelect');

    await expect(page.locator('[role="option"]')).toHaveText('Askr');
  });

  test('should throw when SelectTrigger is used without Select', async ({
    render,
    run,
  }) => {
    await render('orphanTrigger');

    expect(await run<string>('message')).toContain(
      'Select components must be used within <Select>'
    );
  });

  test('should keep vertical option navigation stable under dir="rtl"', async ({
    page,
    render,
    root,
  }) => {
    await render('rtlVertical');
    const focused = focusedText(page);

    await root.locator('[data-slot="select-trigger"]').focus();
    await page.keyboard.press('ArrowDown');
    await expect.poll(focused).toBe('Askr');
    await expect(
      page.locator('[role="option"]').filter({ hasText: /^\s*Solid\s*$/ })
    ).toHaveCount(1);

    await page.keyboard.press('ArrowDown');
    await expect.poll(focused).toBe('Solid');

    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    await expect.poll(focused).toBe('Solid');
  });

  test('should restore uncontrolled state when its native form resets', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('formReset');
    const hidden = root.locator('input[name="framework"]');

    await root
      .locator('[data-slot="select-trigger"]')
      .evaluate((node: HTMLElement) => node.click());
    await page
      .locator('[role="option"]')
      .filter({ hasText: /^\s*Solid\s*$/ })
      .evaluate((node: HTMLElement) => node.click());
    await expect(hidden).toHaveValue('solid');

    await run('reset');
    await expect(hidden).toHaveValue('askr');
    expect(await run<string[][]>('calls')).toEqual([['solid'], ['askr']]);
  });
});
