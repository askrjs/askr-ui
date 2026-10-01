import type { Locator } from '@playwright/test';

import { expect, test } from '../../fixtures';

/** `ACCORDION_A11Y_CONTRACT.EXPANDED_ATTRIBUTE`. */
const EXPANDED = 'aria-expanded';

function button(root: Locator, name: string): Locator {
  return root.getByRole('button', { name, exact: true });
}

test.describe('Accordion - Behavior', () => {
  test('should mount single and multiple accordions without render-time state errors', async ({
    render,
    root,
    run,
  }) => {
    await render('mountsWithoutRenderErrors');

    expect(await run<string | null>('error')).toBeNull();
    await expect(root.locator('[data-slot="accordion"]')).toHaveCount(2);
  });

  test('should support single and multiple open state', async ({
    render,
    root,
  }) => {
    await render('openStateModes');

    await button(root, 'Two').click();

    await expect(button(root, 'Two')).toHaveAttribute(EXPANDED, 'true');
    await expect(button(root, 'One')).toHaveAttribute(EXPANDED, 'false');

    await button(root, 'Two multiple').click();

    await expect(
      root
        .locator(`[data-accordion] button[${EXPANDED}="true"]`)
        .filter({ hasText: 'multiple' })
    ).toHaveCount(2);
  });

  test('should preserve consecutive uncontrolled updates before rerender', async ({
    render,
    run,
  }) => {
    await render('consecutiveUncontrolledUpdates');

    // Both clicks run in one browser task, with no flush between them.
    expect(await run<string[][]>('clickBoth')).toEqual([
      ['one'],
      ['one', 'two'],
    ]);

    await run('flush');

    expect(await run<number>('expandedCount')).toBe(2);
  });

  test('should activate an asChild trigger with Enter and Space', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('asChildKeyboardActivation');
    const trigger = root.locator('[data-slot="accordion-trigger"]');

    await run('focusTrigger');
    await page.keyboard.press('Enter');

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(root).toContainText('Body');

    await run('focusTrigger');
    await page.keyboard.press(' ');

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(root).not.toContainText('Body');
  });

  test('should move focus when the focused trigger becomes disabled', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('focusMovesWhenTriggerDisabled');

    await run('focusSecondTrigger');
    await run('disableSecondItem');
    await expect(button(root, 'Three')).toBeFocused();

    await page.keyboard.press('ArrowUp');
    await expect(button(root, 'One')).toBeFocused();
  });

  test('should keep controlled state props off the native root', async ({
    render,
    root,
  }) => {
    await render('controlledPropsOffRoot');
    const accordion = root.locator('[data-slot="accordion"]');

    await expect(accordion).toHaveCount(1);
    await expect(accordion).not.toHaveAttribute('value');
    await expect(accordion).not.toHaveAttribute('defaultvalue');
    await expect(accordion).not.toHaveAttribute('onvaluechange');
  });

  test('should throw when AccordionItem is used outside Accordion', async ({
    render,
    run,
  }) => {
    await render('itemOutsideAccordion');

    expect(await run<string | null>('error')).toContain(
      'Accordion components must be used within <Accordion>'
    );
  });

  test('should throw when AccordionHeader is used outside AccordionItem', async ({
    render,
    run,
  }) => {
    await render('headerOutsideItem');

    expect(await run<string | null>('error')).toContain(
      'Accordion parts must be used within <AccordionItem>'
    );
  });

  test('should throw when AccordionContent is used outside AccordionItem', async ({
    render,
    run,
  }) => {
    await render('contentOutsideItem');

    expect(await run<string | null>('error')).toContain(
      'Accordion parts must be used within <AccordionItem>'
    );
  });

  test('should preserve dataset indices and advance focus through a virtualized window', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('virtualizedWindow');
    const viewport = root.locator('[data-slot="virtual-list"]');

    await run('scrollTo', 800);

    await expect(viewport).toHaveAttribute(
      'data-virtual-visible-start-index',
      '40'
    );
    await expect(button(root, 'Item 43')).toHaveCount(0);

    await button(root, 'Item 42').click();
    await run('focusButton', 'Item 42');
    await expect(button(root, 'Item 42')).toBeFocused();
    await expect(
      root.locator('[data-slot="virtual-list-row"]', {
        // `has` resolves relative to each row, so it must not be root-scoped.
        has: page.getByRole('button', { name: 'Item 42', exact: true }),
      })
    ).toHaveAttribute('data-askr-virtual-list-row-height', '20');

    await page.keyboard.press('ArrowDown');
    expect(await run<boolean | null>('lastKeydownPrevented')).toBe(true);

    await expect
      .poll(async () =>
        Number(await viewport.getAttribute('data-virtual-visible-start-index'))
      )
      .toBeGreaterThan(40);
    await expect(button(root, 'Item 43')).toBeFocused();
  });
});
