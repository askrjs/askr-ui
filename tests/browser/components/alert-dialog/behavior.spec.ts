import { expect, test } from '../../fixtures';

test.describe('AlertDialog - Behavior', () => {
  test('should request one controlled close for a native Escape', async ({
    page,
    render,
    run,
  }) => {
    await render('controlledEscapeRequest');
    await page.keyboard.press('Escape');
    expect(await run('openChanges')).toEqual([[false]]);
  });

  test('should default content to alertdialog while allowing an explicit role', async ({
    page,
    render,
  }) => {
    await render('defaultAndExplicitRole');
    const contents = page.locator('[data-slot="dialog-content"]');

    await expect(contents).toHaveCount(2);
    expect(
      await contents.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('role'))
      )
    ).toEqual(['alertdialog', 'dialog']);
  });

  test('should keep trigger expansion state open after re-activation', async ({
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
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('should preserve button styling props when composed controls are children', async ({
    page,
    render,
    root,
  }) => {
    await render('composedButtons');
    const trigger = root.locator('[aria-haspopup="dialog"]');

    await expect(trigger).toHaveAttribute('data-slot', 'button');
    await expect(trigger).toHaveAttribute('data-variant', 'destructive');

    await trigger.click();

    const controls = page.locator('[data-dialog-close="true"]');
    await expect(controls).toHaveCount(2);
    expect(
      await controls.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('data-slot'))
      )
    ).toEqual(['button', 'button']);
    expect(
      await controls.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('data-variant'))
      )
    ).toEqual(['outline', 'destructive']);

    await controls.first().click();

    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(0);
  });

  test('should forward dismiss callbacks from alert dialog content', async ({
    page,
    render,
    run,
  }) => {
    await render('dismissCallback');
    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(1);

    await page.keyboard.press('Escape');

    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(0);
    expect(await run<number>('dismissCount')).toBe(1);
  });

  for (const closeMethod of ['escape', 'cancel', 'action'] as const) {
    test(`should restore an explicit persistent target after triggerless ${closeMethod} close`, async ({
      page,
      render,
      root,
      run,
    }) => {
      await render('persistentRestoreTarget');
      const persistentTrigger = root.getByRole('button', {
        name: 'Open invite actions',
      });

      await persistentTrigger.focus();
      await persistentTrigger.click();

      const content = page.locator('[data-slot="dialog-content"]');
      await expect(content).toHaveCount(1);
      await expect.poll(() => run<boolean>('focusInContent')).toBe(true);

      if (closeMethod === 'escape') {
        await page.keyboard.press('Escape');
      } else {
        const label = closeMethod === 'cancel' ? 'Cancel' : 'Reset link';
        await page
          .locator('[data-dialog-close="true"]')
          .filter({ hasText: label })
          .click();
      }

      await expect(content).toHaveCount(0);
      await expect(persistentTrigger).toBeFocused();
      expect(await run<boolean>('focusOnPersistentTrigger')).toBe(true);
    });
  }

  test('should keep centered alert dialog content within viewport padding on narrow viewports', async ({
    page,
    render,
    root,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await render('narrowViewport');

    await root.locator('[aria-haspopup="dialog"]').click();

    const content = page.locator('[data-slot="dialog-content"]');
    await expect(content).toHaveCSS('left', '20px');
    await expect(content).toHaveCSS('top', '20px');
    await expect(content).toHaveCSS('max-width', '350px');
    await expect(content).toHaveCSS('max-height', '804px');
  });
});
