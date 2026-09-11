import { type DeterministicRender, expectDeterministic } from '../../assertions';
import { expect, test } from '../../fixtures';

test.describe('Collapsible — Determinism', () => {
  test.describe('Render Determinism', () => {
    test('should produce identical output given identical props (closed)', async ({
      render,
      run,
    }) => {
      await render('closedMarkup');

      await expectDeterministic(await run<DeterministicRender[]>('renders'));
    });

    test('should produce identical output given identical props (open)', async ({
      render,
      run,
    }) => {
      await render('openMarkup');

      await expectDeterministic(await run<DeterministicRender[]>('renders'));
    });

    test('should produce identical output given identical props (disabled)', async ({
      render,
      run,
    }) => {
      await render('disabledMarkup');

      await expectDeterministic(await run<DeterministicRender[]>('renders'));
    });
  });

  test.describe('State Transition Determinism', () => {
    test('should consistently reflect state changes', async ({
      render,
      root,
    }) => {
      await render('stateTransitions');
      const trigger = root.locator('button');

      await expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await trigger.evaluate((node: HTMLElement) => node.click());
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await trigger.evaluate((node: HTMLElement) => node.click());
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');

      await trigger.evaluate((node: HTMLElement) => node.click());
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });
  });

  test.describe('ARIA Attribute Presence', () => {
    test('should always include aria-expanded on trigger', async ({
      render,
      root,
    }) => {
      await render('ariaPresenceClosed');

      await expect(root.locator('button')).toHaveAttribute('aria-expanded');
    });

    test('should always include aria-controls on trigger', async ({
      render,
      root,
    }) => {
      await render('ariaPresenceClosed');

      await expect(root.locator('button')).toHaveAttribute('aria-controls');
    });

    test('should always include id on content when mounted', async ({
      render,
      root,
    }) => {
      await render('ariaPresenceOpen');

      await expect(
        root.locator('[id^="collapsible-content"]')
      ).toHaveAttribute('id');
    });
  });

  test.describe('Content Presence Determinism', () => {
    test('should consistently mount and unmount content', async ({
      render,
      root,
    }) => {
      await render('contentPresence');
      const trigger = root.locator('button');
      const content = root.locator('[id^="collapsible-content"]');

      // Initially closed - content not in DOM
      await expect(content).toHaveCount(0);

      // Open - content in DOM
      await trigger.evaluate((node: HTMLElement) => node.click());
      await expect(content).toHaveCount(1);

      // Close - content removed from DOM
      await trigger.evaluate((node: HTMLElement) => node.click());
      await expect(content).toHaveCount(0);

      // Reopen - content in DOM again
      await trigger.evaluate((node: HTMLElement) => node.click());
      await expect(content).toHaveCount(1);
    });

    test('should keep content mounted when forceMount', async ({
      render,
      root,
    }) => {
      await render('forceMountPresence');
      const trigger = root.locator('button');
      const content = root.locator('[id^="collapsible-content"]');

      // Content in DOM even when closed
      await expect(content).toHaveCount(1);

      // Open
      await trigger.evaluate((node: HTMLElement) => node.click());
      await expect(content).toHaveCount(1);

      // Close again - still in DOM
      await trigger.evaluate((node: HTMLElement) => node.click());
      await expect(content).toHaveCount(1);
    });
  });

  test.describe('ID Generation Determinism', () => {
    test('should generate consistent IDs for same collapsible instance', async ({
      render,
      run,
    }) => {
      await render('idGeneration');
      const ids = await run<{
        controlsId: string | null;
        contentId: string;
        contentIdAfter: string;
        controlsIdAfter: string | null;
      }>('ids');

      // aria-controls should always match content id
      expect(ids.controlsId).toBe(ids.contentId);
      expect(ids.contentIdAfter).toBe(ids.contentId);
      expect(ids.controlsIdAfter).toBe(ids.controlsId);
    });
  });

  test.describe('Children Stability', () => {
    test('should render stable content given static children', async ({
      render,
      run,
    }) => {
      await render('stableChildren');

      await expectDeterministic(await run<DeterministicRender[]>('renders'));
    });
  });
});
