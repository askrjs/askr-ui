import type { Page } from '@playwright/test';

import { expect, test } from '../../fixtures';

/** Trimmed text of the focused element; select content is portalled. */
function focusedText(page: Page) {
  return () => page.evaluate(() => document.activeElement?.textContent?.trim());
}

test.describe('Select - Behavior', () => {
  for (const callerAria of [false, true]) {
    test(`should ${callerAria ? 'preserve caller ARIA despite' : 'associate'} a custom native content ID`, async ({
      render,
      root,
      page,
      run,
    }) => {
      await render('customContentId', { callerAria });
      const trigger = root.locator('[data-slot="select-trigger"]');
      const content = page.locator('[data-slot="select-content"]');
      await expect(content).toHaveAttribute('id', 'caller-select-content');
      await expect(trigger).toHaveAttribute(
        'aria-controls',
        callerAria ? 'caller-owned-controls' : 'caller-select-content',
        { timeout: 1000 }
      );
      await run('updateId');
      await expect(content).toHaveAttribute('id', 'updated-select-content');
      await expect(trigger).toHaveAttribute(
        'aria-controls',
        callerAria ? 'caller-owned-controls' : 'updated-select-content',
        { timeout: 1000 }
      );
    });
  }

  test('should follow a reactive caller group label id through updates and removal', async ({
    render,
    root,
    run,
  }) => {
    await render('reactiveGroupLabelId');
    const group = root.getByRole('group', { name: 'Frameworks', exact: true });
    await expect(group).toHaveAttribute('aria-labelledby', 'caller-frameworks');
    await run('updateId');
    await expect(group).toHaveAttribute(
      'aria-labelledby',
      'updated-frameworks'
    );
    await run('hide');
    await expect(root.locator('[role="group"]')).not.toHaveAttribute(
      'aria-labelledby',
      /.+/
    );
    await run('show');
    await expect(group).toHaveAttribute(
      'aria-labelledby',
      'updated-frameworks'
    );
  });

  for (const target of ['trigger', 'item'] as const) {
    for (const cancel of [false, true]) {
      test(`should ${cancel ? 'suppress' : 'allow'} ${target} default when the caller ${cancel ? 'cancels' : 'observes'} own keydown`, async ({
        page,
        render,
        root,
        run,
      }) => {
        await render('ownKeyboardCaller', { target, cancel });
        const first =
          target === 'trigger'
            ? root.locator('[aria-haspopup="listbox"]')
            : page.getByRole('option', { name: 'One', exact: true });
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
            page.getByRole('option', {
              name: cancel ? 'One' : 'Two',
              exact: true,
            })
          ).toBeFocused({ timeout: 1000 });
        expect(await run<number>('calls')).toBe(1);
      });
    }
  }

  test('should preserve option focus when the caller cancels navigation', async ({
    page,
    render,
    run,
  }) => {
    await render('callerCancellation');
    const first = page.getByRole('option', { name: 'One', exact: true });
    await expect(page.getByRole('listbox')).toHaveAttribute(
      'data-caller',
      'preserved'
    );
    await first.focus();
    await page.keyboard.press('ArrowDown');
    await expect(first).toBeFocused({ timeout: 1000 });
    expect(await run<number>('calls')).toBe(1);
  });

  test('should preserve placeholder behavior when a known literal selected option is removed', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('removedLiteralOption');
    const trigger = root.locator('[aria-haspopup="listbox"]');
    await expect(trigger).toHaveText('Askr');
    await trigger.click();
    await page
      .locator('[role="listbox"]')
      .dispatchEvent('keydown', { key: 'Escape', bubbles: true });
    await run('removeSelected');
    await expect(trigger).toHaveText('Choose one');
  });

  test('should preserve option focus when an ancestor cancels an orientation arrow', async ({
    page,
    render,
    root,
  }) => {
    await render('bufferedTypeahead');
    await root.locator('[aria-haspopup="listbox"]').click();
    const first = page.getByRole('option', { name: 'Alpha', exact: true });
    await first.focus();
    await first.evaluate((node: HTMLElement) => {
      node
        .closest('[role="listbox"]')!
        .addEventListener('keydown', (event) => event.preventDefault(), {
          capture: true,
          once: true,
        });
    });
    await page.keyboard.press('ArrowDown');
    await expect(first).toBeFocused({ timeout: 1000 });
  });

  for (const action of ['click', 'Enter', 'Space'] as const) {
    test(`should suppress ${action} activation canceled by an ancestor in capture`, async ({
      page,
      render,
      root,
    }) => {
      await render('asChildTrigger');
      const trigger = root.locator('[data-slot="select-trigger"]');
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

  test('should retain For option text through closing and native form reset', async ({
    page,
    render,
    root,
  }) => {
    await render('wrappedOptions', { forRendered: true });
    const trigger = root.locator('[aria-haspopup="listbox"]');
    await trigger.click();
    await page.getByRole('option', { name: 'Solid', exact: true }).click();
    await expect(trigger).toHaveText('Solid');
    await root.getByRole('button', { name: 'Reset choice' }).click();
    await expect(root.locator('input[type="hidden"]')).toHaveValue('askr');
    await expect(trigger).toHaveText('Askr');
  });

  test('should clear and restore an owned wrapped group label without changing caller labels', async ({
    render,
    root,
    run,
  }) => {
    await render('removableWrappedLabel');
    const group = root.getByRole('group', { name: 'Frameworks', exact: true });
    const ownedGroup = root.locator('[data-slot="select-group"]').first();
    await expect(group).toHaveCount(1);
    await expect(
      root.getByRole('group', { name: 'Caller name', exact: true })
    ).toHaveCount(1);
    await run('hideLabel');
    await expect(ownedGroup).not.toHaveAttribute('aria-labelledby', /.+/);
    await run('showLabel');
    await expect(group).toHaveCount(1);
    await expect(
      root.getByRole('group', { name: 'Caller name', exact: true })
    ).toHaveCount(1);
  });

  test('should retain selected text after choosing a wrapped option and closing', async ({
    page,
    render,
    root,
  }) => {
    await render('wrappedOptions');
    const trigger = root.locator('[aria-haspopup="listbox"]');
    await trigger.click();
    await page.getByRole('option', { name: 'Solid', exact: true }).click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(root.locator('input[type="hidden"]')).toHaveValue('solid');
    await expect(trigger).toHaveText('Solid');
    await trigger.click();
    await expect(
      page.getByRole('option', { name: 'Solid', exact: true })
    ).toHaveAttribute('aria-selected', 'true');
  });

  test('should label a select group through a wrapped label component', async ({
    page,
    render,
    root,
  }) => {
    await render('wrappedOptions');
    await root.locator('[aria-haspopup="listbox"]').click();
    await expect(page.getByRole('group', { name: 'Frameworks' })).toHaveCount(
      1
    );
  });

  test('should navigate from an option focused directly by the caller without selecting it', async ({
    page,
    render,
    root,
  }) => {
    await render('bufferedTypeahead');
    const trigger = root.locator('[aria-haspopup="listbox"]');
    await trigger.click();
    await page.getByRole('option', { name: 'Delta', exact: true }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(
      page.getByRole('option', { name: 'Alpha', exact: true })
    ).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(root.locator('input[type="hidden"]')).toHaveValue('alpha');
  });

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
