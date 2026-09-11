import { expect, test } from '../../fixtures';

interface CollapsibleContract {
  EXPANDED_ATTRIBUTE: string;
  CONTROLS_ATTRIBUTE: string;
}

test.describe('Collapsible — Accessibility', () => {
  test.describe('Automated Axe Checks', () => {
    test('should have no automated axe violations given closed collapsible', async ({
      render,
      axeViolations,
    }) => {
      await render('axeClosed');

      expect(await axeViolations()).toEqual([]);
    });

    test('should have no automated axe violations given open collapsible', async ({
      render,
      axeViolations,
    }) => {
      await render('axeOpen');

      expect(await axeViolations()).toEqual([]);
    });

    test('should have no automated axe violations given disabled collapsible', async ({
      render,
      axeViolations,
    }) => {
      await render('axeDisabled');

      expect(await axeViolations()).toEqual([]);
    });
  });

  test.describe('ARIA Contract Enforcement', () => {
    test('should apply aria-expanded=false when closed', async ({
      render,
      root,
      run,
    }) => {
      await render('expandedClosed');
      const contract = await run<CollapsibleContract>('contract');

      await expect(root.locator('button')).toHaveAttribute(
        contract.EXPANDED_ATTRIBUTE,
        'false'
      );
    });

    test('should apply aria-expanded=true when open', async ({
      render,
      root,
      run,
    }) => {
      await render('expandedOpen');
      const contract = await run<CollapsibleContract>('contract');

      await expect(root.locator('button')).toHaveAttribute(
        contract.EXPANDED_ATTRIBUTE,
        'true'
      );
    });

    test('should apply aria-controls to trigger', async ({ render, run }) => {
      await render('ariaControls');
      const ids = await run<{ controlsId?: string; contentId?: string }>('ids');

      expect(ids.controlsId).toBeDefined();
      expect(ids.contentId).toBe(ids.controlsId);
    });

    test('should apply id to content', async ({ render, root }) => {
      await render('contentId');
      const content = root.locator('[id^="collapsible-content"]');

      await expect(content).toHaveAttribute(
        'id',
        /^collapsible-content-[a-z0-9-]+$/
      );
    });

    test('should have button role on trigger', async ({ render, root }) => {
      await render('triggerRole');

      // Native buttons have implicit role='button'
      await expect(root.locator('button')).toHaveCount(1);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be focusable when not disabled', async ({ render, run }) => {
      await render('focusableTrigger');

      expect(await run<boolean>('focusTrigger')).toBe(true);
    });

    test('should not be focusable when disabled', async ({ render, run }) => {
      await render('disabledTriggerFocus');

      // Disabled buttons cannot receive focus
      expect(await run<boolean>('focusTrigger')).toBe(false);
    });
  });

  test.describe('Focus Management', () => {
    test('should keep focus on trigger after activation', async ({
      render,
      run,
    }) => {
      await render('focusAfterActivation');

      expect(await run<boolean>('activateAndRefocus')).toBe(true);
    });
  });

  test.describe('Disabled State Semantics', () => {
    test('should apply disabled attribute to native button', async ({
      render,
      root,
    }) => {
      await render('disabledNativeButton');

      await expect(root.locator('button')).toBeDisabled();
    });

    test('should apply aria-disabled to asChild trigger', async ({
      render,
      root,
    }) => {
      await render('disabledAsChild');

      await expect(root.locator('[role="button"]')).toHaveAttribute(
        'aria-disabled',
        'true'
      );
    });
  });

  test.describe('Content Presence', () => {
    test('should not render content in DOM when closed by default', async ({
      render,
      root,
    }) => {
      await render('contentClosed');

      await expect(root.locator('[id^="collapsible-content"]')).toHaveCount(0);
    });

    test('should render content in DOM when open', async ({ render, root }) => {
      await render('contentOpen');

      await expect(root.locator('[id^="collapsible-content"]')).toHaveCount(1);
    });

    test('should render content in DOM when forceMount', async ({
      render,
      root,
    }) => {
      await render('contentForceMount');

      await expect(root.locator('[id^="collapsible-content"]')).toHaveCount(1);
    });
  });
});
