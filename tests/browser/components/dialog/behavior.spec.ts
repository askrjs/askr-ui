import type { Locator } from '@playwright/test';

import { expect, test } from '../../fixtures';

function zIndex(locator: Locator): Promise<number> {
  return locator.evaluate((node) => Number(getComputedStyle(node).zIndex));
}

test.describe('Dialog - Behavior', () => {
  test('should associate content with the actual custom part ids', async ({
    render,
    page,
  }) => {
    await render('customPartIds');
    const content = page.getByRole('dialog');
    await expect(content).toHaveAttribute('aria-labelledby', 'custom-title');
    await expect(content).toHaveAttribute(
      'aria-describedby',
      'custom-description'
    );
    await expect(content).toHaveAccessibleName('Custom title');
    await expect(content).toHaveAccessibleDescription('Custom description');
  });

  test('should preserve caller aria associations when internal parts exist', async ({
    render,
    page,
  }) => {
    await render('callerAriaWithParts');
    const content = page.getByRole('dialog');
    await expect(content).toHaveAttribute('aria-labelledby', 'external-title');
    await expect(content).toHaveAttribute(
      'aria-describedby',
      'external-description'
    );
    await expect(content).toHaveAccessibleName('External title');
    await expect(content).toHaveAccessibleDescription('External description');
  });

  test('should resolve reactive part ids once per render and update associations', async ({
    render,
    run,
    page,
  }) => {
    await render('reactivePartIds');
    const content = page.getByRole('dialog');
    expect(await run('reads')).toEqual({ title: 1, description: 1 });
    await expect(content).toHaveAttribute('aria-labelledby', 'title-initial');
    await expect(content).toHaveAttribute(
      'aria-describedby',
      'description-initial'
    );
    await run('update');
    expect(await run('reads')).toEqual({ title: 2, description: 2 });
    await expect(content).toHaveAttribute('aria-labelledby', 'title-updated');
    await expect(content).toHaveAttribute(
      'aria-describedby',
      'description-updated'
    );
  });

  test('should remove conditional part associations and restore them after remount', async ({
    render,
    run,
    page,
  }) => {
    await render('conditionalParts');
    const content = page.getByRole('dialog');
    await expect(content).toHaveAttribute(
      'aria-labelledby',
      'conditional-title'
    );
    await expect(content).toHaveAttribute(
      'aria-describedby',
      'conditional-description'
    );
    await run('setVisible', false);
    await expect(content).not.toHaveAttribute('aria-labelledby');
    await expect(content).not.toHaveAttribute('aria-describedby');
    await run('setVisible', true);
    await expect(content).toHaveAttribute(
      'aria-labelledby',
      'conditional-title'
    );
    await expect(content).toHaveAttribute(
      'aria-describedby',
      'conditional-description'
    );
  });

  for (const nullAria of [false, true]) {
    test(`should ${nullAria ? 'preserve omitted' : 'apply automatic'} associations when caller aria is ${nullAria ? 'null' : 'undefined'}`, async ({
      render,
      page,
    }) => {
      await render('absentCallerAria', { nullAria });
      const content = page.getByRole('dialog');
      if (nullAria) {
        await expect(content).not.toHaveAttribute('aria-labelledby');
        await expect(content).not.toHaveAttribute('aria-describedby');
      } else {
        await expect(content).toHaveAttribute(
          'aria-labelledby',
          'absent-title'
        );
        await expect(content).toHaveAttribute(
          'aria-describedby',
          'absent-description'
        );
      }
    });
  }

  test('should preserve normal generated part associations', async ({
    render,
    page,
  }) => {
    await render('generatedPartAssociations');
    const content = page.getByRole('dialog');
    await expect(content).toHaveAccessibleName('Generated title');
    await expect(content).toHaveAccessibleDescription('Generated description');
    const titleId = await page
      .locator('[data-slot="dialog-title"]')
      .getAttribute('id');
    const descriptionId = await page
      .locator('[data-slot="dialog-description"]')
      .getAttribute('id');
    await expect(content).toHaveAttribute('aria-labelledby', titleId!);
    await expect(content).toHaveAttribute('aria-describedby', descriptionId!);
  });

  for (const callerControls of [false, true]) {
    test(`should ${callerControls ? 'preserve caller controls' : 'reference the actual custom content id'} on a dialog trigger`, async ({
      render,
      page,
    }) => {
      await render('customContentControls', { callerControls });
      await expect(
        page.locator('[data-slot="dialog-trigger"]')
      ).toHaveAttribute(
        'aria-controls',
        callerControls ? 'external-controls' : 'custom-dialog-content'
      );
    });
  }

  test('should update automatic controls after a native content id binding commits', async ({
    render,
    run,
    page,
  }) => {
    await render('reactiveContentControls');
    const trigger = page.locator('[data-slot="dialog-trigger"]');
    const content = page.getByRole('dialog');
    expect(await run('reads')).toBe(1);
    await expect(trigger).toHaveAttribute('aria-controls', 'content-initial');
    await run('update');
    expect(await run('reads')).toBe(2);
    await expect(content).toHaveAttribute('id', 'content-updated');
    await expect(trigger).toHaveAttribute('aria-controls', 'content-updated');
  });

  test('should keep wrapped native portal parts in their owning dialog', async ({
    render,
    page,
  }) => {
    await render('nestedPortaledParts');
    const outer = page
      .locator('[data-slot="dialog-content"]')
      .filter({ has: page.locator('[id="outer-native-title"]') });
    const portaled = page.getByRole('dialog', { name: 'Portaled title' });
    await expect(outer).toHaveAttribute(
      'aria-labelledby',
      'outer-native-title'
    );
    await expect(outer).not.toHaveAttribute('aria-describedby');
    await expect(portaled).toHaveAttribute('aria-labelledby', 'portaled-title');
    await expect(portaled).toHaveAttribute(
      'aria-describedby',
      'portaled-description'
    );
    await expect(portaled).toHaveAccessibleDescription('Portaled description');
  });

  test('should restore part associations when dialog content reopens', async ({
    render,
    run,
    page,
  }) => {
    await render('reopenedParts');
    const content = page.getByRole('dialog');
    await expect(content).toHaveAttribute('aria-labelledby', 'reopened-title');
    await run('setOpen', false);
    await expect(content).toHaveCount(0);
    await run('setOpen', true);
    await expect(content).toHaveAttribute('aria-labelledby', 'reopened-title');
    await expect(content).toHaveAttribute(
      'aria-describedby',
      'reopened-description'
    );
  });
  for (const activation of [
    { asChild: false, mode: 'click' },
    { asChild: true, mode: 'click' },
    { asChild: true, mode: 'Enter' },
    { asChild: true, mode: 'Space' },
  ]) {
    test(`should honor ancestor-canceled ${activation.mode} on ${activation.asChild ? 'asChild' : 'native'} triggers`, async ({
      page,
      render,
      root,
      run,
    }) => {
      await render('ancestorCanceledTrigger', activation);
      const trigger = root.locator('[data-slot="dialog-trigger"]');
      if (activation.mode === 'click') await trigger.click();
      else {
        await trigger.focus();
        await page.keyboard.press(activation.mode);
      }
      await expect(trigger).toHaveAttribute('data-state', 'closed');
      expect(await run('pressCount')).toBe(0);
      expect(await run('openChanges')).toEqual([]);
    });
  }

  test('should move and restore focus while force-mounted content opens and closes', async ({
    page,
    render,
    root,
  }) => {
    await render('forceMountedToggle');
    const trigger = root.locator('[data-slot="dialog-trigger"]');
    const content = page.locator('[data-slot="dialog-content"]');
    const originalContent = await content.elementHandle();
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(content.getByRole('button')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(content).toHaveAttribute('data-state', 'closed');
    expect(await originalContent!.evaluate((node) => node.isConnected)).toBe(
      true
    );
  });

  test('should leave focus and Escape untouched while force-mounted content is closed', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('forceMountedClosed');
    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(1);
    await expect(root.getByTestId('before')).toBeFocused();
    await page.keyboard.press('Escape');
    expect(await run('openChanges')).toEqual([]);
  });

  test('should preserve an explicit accessible label reference without a DialogTitle', async ({
    page,
    render,
  }) => {
    await render('explicitAriaLabelledBy');
    await expect(page.getByRole('dialog')).toHaveAttribute(
      'aria-labelledby',
      'external-dialog-label'
    );
    await expect(page.getByRole('dialog')).toHaveAccessibleName(
      'External dialog label'
    );
  });

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
