import { expect, test } from '../../fixtures';

interface OpenChangeState {
  calls: boolean[];
  text: string;
}

test.describe('Collapsible — Behavior', () => {
  test.describe('State Management', () => {
    test('should not transfer pending focus to a recycled virtual row', async ({
      render,
      run,
    }) => {
      await render('recycledVirtualRow');
      const result = await run<{
        firstContentId: string | null;
        replacementRowId: string | null;
        replacementContentId: string | null;
        replacementFocused: boolean;
      }>('recycle');

      expect(result.firstContentId).not.toBeNull();
      expect(result.replacementRowId).toBe('row-b');
      expect(result.replacementContentId).not.toBe(result.firstContentId);
      expect(result.replacementFocused).toBe(false);
    });

    test('should start closed given no defaultOpen', async ({
      render,
      root,
    }) => {
      await render('startClosed');

      // unmounted when closed
      await expect(root.locator('#collapsible-content-1')).toHaveCount(0);
    });

    test('should start open given defaultOpen=true', async ({
      render,
      root,
    }) => {
      await render('startOpen');

      await expect(root).toContainText('Content');
    });

    test('should toggle state given click on trigger', async ({
      render,
      root,
    }) => {
      await render('toggleOnClick');
      const trigger = root.locator('button');

      // Initially closed
      await expect(root).not.toContainText('Content');

      // Click to open
      await trigger.evaluate((node: HTMLElement) => node.click());
      await expect(root).toContainText('Content');

      // Click to close
      await trigger.evaluate((node: HTMLElement) => node.click());
      await expect(root).not.toContainText('Content');
    });
  });

  test.describe('Controlled Mode', () => {
    test('should use controlled open state', async ({ render, root }) => {
      await render('controlledOpen');

      await expect(root).toContainText('Content');
    });

    test('should call onOpenChange when trigger activated', async ({
      render,
      root,
      run,
    }) => {
      await render('controlledOpenChange');
      await root
        .locator('button')
        .evaluate((node: HTMLElement) => node.click());

      expect(await run<boolean[]>('openChangeArgs')).toContainEqual(true);
    });
  });

  test.describe('Trigger Component', () => {
    test('should render native button by default', async ({ render, root }) => {
      await render('nativeTrigger');
      const button = root.locator('button');

      await expect(button).toHaveCount(1);
      await expect(button).toHaveText('Toggle');
    });

    test('should set type=button on native button', async ({
      render,
      root,
    }) => {
      await render('nativeTrigger');

      await expect(root.locator('button')).toHaveAttribute('type', 'button');
    });

    test('should support asChild rendering', async ({ render, root }) => {
      await render('asChildTrigger');
      const span = root.locator('span');

      await expect(span).toHaveCount(1);
      await expect(span).toHaveText('Custom Trigger');
    });

    test('should toggle exactly once with Enter and Space on native and asChild triggers', async ({
      page,
      render,
      run,
    }) => {
      await render('keyboardToggle');

      await run('focusNative');
      await page.keyboard.press('Enter');
      await run('flush');

      let native = await run<OpenChangeState>('nativeState');
      expect(native.calls).toHaveLength(1);
      expect(native.calls.at(-1)).toBe(true);
      expect(native.text).toContain('Native content');

      await run('focusNative');
      await page.keyboard.press(' ');
      await run('flush');

      native = await run<OpenChangeState>('nativeState');
      expect(native.calls).toHaveLength(2);
      expect(native.calls.at(-1)).toBe(false);
      expect(native.text).not.toContain('Native content');

      await run('mountChild');

      await run('focusChild');
      await page.keyboard.press('Enter');
      await run('flush');

      let child = await run<OpenChangeState>('childState');
      expect(child.calls).toHaveLength(1);
      expect(child.calls.at(-1)).toBe(true);
      expect(child.text).toContain('Child content');

      await run('focusChild');
      await page.keyboard.press(' ');
      await run('flush');

      child = await run<OpenChangeState>('childState');
      expect(child.calls).toHaveLength(2);
      expect(child.calls.at(-1)).toBe(false);
      expect(child.text).not.toContain('Child content');
    });

    test('should preserve button styling props when trigger composes as child', async ({
      render,
      root,
    }) => {
      await render('buttonComposition');
      const trigger = root.locator('button');

      await expect(trigger).toHaveAttribute('data-slot', 'button');
      await expect(trigger).toHaveAttribute('data-collapsible-trigger', 'true');
      await expect(trigger).toHaveAttribute('data-variant', 'ghost');
      await expect(trigger).toHaveAttribute('data-size', 'sm');

      await trigger.evaluate((node: HTMLElement) => node.click());

      await expect(root).toContainText('Policy detail');
    });
  });

  test.describe('Content Component', () => {
    test('should unmount when closed by default', async ({ render, root }) => {
      await render('contentClosedByDefault');

      await expect(root.locator('[id^="collapsible-content"]')).toHaveCount(0);
    });

    test('should mount when open', async ({ render, root }) => {
      await render('contentMountedWhenOpen');
      const content = root.locator('[id^="collapsible-content"]');

      await expect(content).toHaveCount(1);
      await expect(content).toHaveText('Content');
    });

    test('should force mount when forceMount=true', async ({
      render,
      root,
    }) => {
      await render('contentForceMount');
      const content = root.locator('[id^="collapsible-content"]');

      await expect(content).toHaveCount(1);
      await expect(content).toHaveText('Content');
    });

    test('should support asChild rendering', async ({ render, root }) => {
      await render('asChildContent');
      const section = root.locator('section');

      await expect(section).toHaveCount(1);
      await expect(section).toHaveText('Custom Content');
    });
  });

  test.describe('Disabled State', () => {
    test('should not toggle when disabled', async ({ render, root, run }) => {
      await render('disabledToggle');
      await root
        .locator('button')
        .evaluate((node: HTMLElement) => node.click());

      expect(await run<number>('openChangeCount')).toBe(0);
    });
  });

  test.describe('Context Requirements', () => {
    test('should throw when Trigger used without Collapsible', async ({
      render,
      run,
    }) => {
      await render('orphanTrigger');

      expect(await run<string>('message')).toContain(
        'Collapsible components must be used within <Collapsible>'
      );
    });

    test('should throw when Content used without Collapsible', async ({
      render,
      run,
    }) => {
      await render('orphanContent');

      expect(await run<string>('message')).toContain(
        'Collapsible components must be used within <Collapsible>'
      );
    });
  });

  test.describe('Unique IDs', () => {
    test('should generate unique IDs for multiple collapsibles', async ({
      render,
      run,
    }) => {
      await render('uniqueIds');
      const ids = await run<string[]>('ids');

      expect(ids).toHaveLength(2);
      // All unique
      expect(new Set(ids).size).toBe(2);
    });
  });
});
