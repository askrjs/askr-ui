import { captureFocusTarget } from '../../assertions';
import type { Locator } from '@playwright/test';

import { expect, test } from '../../fixtures';

type Rect = { left: number; right: number; width: number };

function rectOf(locator: Locator): Promise<Rect> {
  return locator.evaluate((node) => {
    const { left, right, width } = node.getBoundingClientRect();
    return { left, right, width };
  });
}

test.describe('Popover - Behavior', () => {
  test('should move and restore focus while force-mounted content opens and closes', async ({
    page,
    render,
    root,
  }) => {
    await render('forceMountedToggle');
    const trigger = root.locator('[data-slot="popover-trigger"]');
    const content = page.locator('[data-slot="popover-content"]');
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
    await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(1);
    await expect(root.getByTestId('before')).toBeFocused();
    await page.keyboard.press('Escape');
    expect(await run('openChanges')).toEqual([]);
  });

  test('should toggle trigger expansion state through the trigger', async ({
    render,
    root,
  }) => {
    await render('triggered');
    const trigger = root.locator('[aria-haspopup="dialog"]');

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('should apply trigger-based dialog labeling by default', async ({
    page,
    render,
    root,
  }) => {
    await render('defaultOpen');
    const trigger = root.locator('[aria-haspopup="dialog"]');
    const content = page.locator('[role="dialog"]');

    await expect(trigger).toHaveCount(1);
    await expect(content).toHaveCount(1);
    await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(1);
    const triggerId = await trigger.getAttribute('id');
    expect(triggerId).toBeTruthy();
    await expect(content).toHaveAttribute('aria-labelledby', triggerId!);
  });

  test('should open and close through asChild Enter and Space presses', async ({
    page,
    render,
    root,
  }) => {
    await render('asChildControls');
    const trigger = root.locator('[data-slot="popover-trigger"]');

    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await page.locator('[data-slot="popover-close"]').focus();
    await page.keyboard.press(' ');

    await expect(page.locator('[data-slot="popover-content"]')).toHaveCount(0);
  });

  test('should portal outside transformed clipping ancestors and restore focus', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('clippingAncestor');
    const trigger = root.locator('[data-slot="popover-trigger"]');
    const checkTriggerFocus = await captureFocusTarget(trigger);
    const content = page.locator('[data-slot="popover-content"]');

    await trigger.focus();
    await trigger.click();

    await expect(content).toHaveCount(1);
    expect(await run<boolean>('ancestorContainsContent')).toBe(false);

    await page.keyboard.press('Escape');

    await expect(content).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await checkTriggerFocus();

    await trigger.click();
    await expect(page.locator('[role="dialog"]')).toHaveCount(1);
    expect(await run<boolean>('ancestorContainsDialog')).toBe(false);
  });

  test('should map typed width affordance to a stable data attribute', async ({
    page,
    render,
  }) => {
    await render('typedWidth');

    await expect(page.locator('[data-slot="popover-content"]')).toHaveAttribute(
      'data-width',
      'md'
    );
  });

  test('should preserve explicit aria-label over automatic trigger labeling', async ({
    page,
    render,
  }) => {
    await render('explicitAriaLabel');
    const content = page.locator('[role="dialog"]');

    await expect(content).toHaveCount(1);
    await expect(content).toHaveAttribute('aria-label', 'Popover details');
    await expect(content).not.toHaveAttribute('aria-labelledby');
  });

  test('should keep custom content positioning through the post-open portal sync', async ({
    page,
    render,
    root,
  }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await render('customPositioning');

    await root.locator('[aria-haspopup="dialog"]').click();

    const content = root.locator('[data-slot="popover-content"]');
    await expect(content).toHaveAttribute('data-side', 'right');
    expect(
      await content.evaluate((node) => (node as HTMLElement).dataset.side)
    ).toBe('right');
    await expect(content).toHaveCSS('left', '148px');
    await expect(content).toHaveCSS('top', '90px');
    await expect(content).not.toHaveAttribute('style');
  });

  test('should mirror start and end alignment for identical RTL trigger geometry', async ({
    page,
    render,
    root,
  }) => {
    await render('rtlAlignment');
    const content = (id: string) => page.locator(`[data-testid="${id}"]`);
    for (const id of ['ltr-start', 'ltr-end', 'rtl-start', 'rtl-end']) {
      await expect(content(id)).toHaveCSS('position', 'fixed');
    }

    const ltrStart = await rectOf(content('ltr-start'));
    const ltrEnd = await rectOf(content('ltr-end'));
    const rtlStart = await rectOf(content('rtl-start'));
    const rtlEnd = await rectOf(content('rtl-end'));
    const ltrTrigger = await rectOf(
      root.locator('[data-testid="ltr-start-trigger"]')
    );
    const rtlTrigger = await rectOf(
      root.locator('[data-testid="rtl-start-trigger"]')
    );

    expect(rtlTrigger.left).toBeCloseTo(ltrTrigger.left, 0);
    expect(rtlTrigger.right).toBeCloseTo(ltrTrigger.right, 0);
    expect(rtlTrigger.width).toBeCloseTo(ltrTrigger.width, 0);
    expect(ltrStart.left).toBeCloseTo(rtlEnd.left, 0);
    expect(ltrEnd.left).toBeCloseTo(rtlStart.left, 0);
    expect(ltrStart.left).toBeGreaterThan(ltrEnd.left);
  });

  test('should expose the position-only clamp boundary for oversized content', async ({
    page,
    render,
    run,
  }) => {
    await render('oversizedContent');
    const content = page.locator('[data-testid="oversized-content"]');
    const innerWidth = await run<number>('innerWidth');

    await expect
      .poll(() =>
        content.evaluate((node) =>
          getComputedStyle(node)
            .getPropertyValue('--ak-overlay-available-width')
            .trim()
        )
      )
      .toBe(`${innerWidth - 24}px`);
    const rect = await rectOf(content);

    expect(rect.width).toBeGreaterThan(innerWidth);
    expect(rect.left).toBeGreaterThanOrEqual(12);
    expect(rect.right).toBeGreaterThan(innerWidth);
  });

  test('should close nested popover without closing parent dialog on Escape', async ({
    page,
    render,
    root,
  }) => {
    await render('nestedInDialog');
    const popoverContent = page.locator('[data-slot="popover-content"]');
    await expect(popoverContent).toHaveCount(1);

    await popoverContent.dispatchEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });

    await expect(page.locator('[data-slot="popover-trigger"]')).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    await expect(root.locator('[data-slot="dialog-trigger"]')).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(1);
  });
});

for (const part of ['trigger', 'content'] as const) {
  test(`should associate actual custom ${part} IDs in committed markup (Popover)`, async ({
    render,
    root,
    page,
  }) => {
    await render('partIdentityAssociations', { part });
    const trigger = root.locator('[data-slot="popover-trigger"]');
    const content = page.locator('[data-slot="popover-content"]');
    await expect(content).toHaveCount(1);
    await expect(part === 'trigger' ? trigger : content).toHaveAttribute(
      'id',
      `custom-popover-${part}`
    );
    const triggerId = await trigger.getAttribute('id');
    const contentId = await content.getAttribute('id');
    expect(triggerId).toBeTruthy();
    expect(contentId).toBeTruthy();
    await expect(trigger).toHaveAttribute('aria-controls', contentId!);
    await expect(content).toHaveAttribute('aria-labelledby', triggerId!);
  });
}
test('should preserve explicit caller ARIA with custom part IDs (Popover)', async ({
  render,
  root,
  page,
}) => {
  await render('partIdentityAssociations', { callerAria: true });
  const trigger = root.locator('[data-slot="popover-trigger"]');
  const content = page.locator('[data-slot="popover-content"]');
  await expect(trigger).toHaveAttribute('id', 'custom-popover-trigger');
  await expect(content).toHaveAttribute('id', 'custom-popover-content');
  await expect(trigger).toHaveAttribute(
    'aria-controls',
    'caller-popover-target'
  );
  await expect(content).toHaveAttribute(
    'aria-labelledby',
    'caller-popover-label'
  );
});

for (const callerAria of [false, true]) {
  test(`Popover updates reactive part IDs with ${callerAria ? 'explicit caller ARIA' : 'automatic associations'}`, async ({
    render,
    run,
    root,
    page,
  }) => {
    await render('reactivePartIdentityAssociations', { callerAria });
    const trigger = root.locator('[data-slot="popover-trigger"]');
    const content = page.locator('[data-slot="popover-content"]');
    await expect(trigger).toHaveAttribute(
      'id',
      'reactive-popover-trigger-initial'
    );
    await expect(content).toHaveAttribute(
      'id',
      'reactive-popover-content-initial'
    );
    expect(await run('reads')).toEqual({ trigger: 1, content: 1 });
    await expect(trigger).toHaveAttribute(
      'aria-controls',
      callerAria ? 'caller-popover-target' : 'reactive-popover-content-initial'
    );
    await expect(content).toHaveAttribute(
      'aria-labelledby',
      callerAria ? 'caller-popover-label' : 'reactive-popover-trigger-initial'
    );
    await run('update');
    await expect(trigger).toHaveAttribute(
      'id',
      'reactive-popover-trigger-updated'
    );
    await expect(content).toHaveAttribute(
      'id',
      'reactive-popover-content-updated'
    );
    expect(await run('reads')).toEqual({ trigger: 2, content: 2 });
    await expect(trigger).toHaveAttribute(
      'aria-controls',
      callerAria ? 'caller-popover-target' : 'reactive-popover-content-updated'
    );
    await expect(content).toHaveAttribute(
      'aria-labelledby',
      callerAria ? 'caller-popover-label' : 'reactive-popover-trigger-updated'
    );
  });
}
