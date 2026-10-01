import { expect, test } from '../../fixtures';

test.describe('ScrollArea - Behavior', () => {
  test('should expose canonical viewport and scrollbar hooks', async ({
    render,
    root,
  }) => {
    await render('canonicalHooks');

    await expect(root.locator('[data-slot="scroll-area-viewport"]')).toHaveCount(1);
    await expect(root.locator('[data-slot="scroll-area-scrollbar"]')).toHaveCount(1);
    await expect(root.locator('[data-slot="scroll-area-thumb"]')).toHaveCount(1);
    await expect(root.locator('[data-slot="scroll-area-corner"]')).toHaveCount(1);
  });

  test('should not emit inline viewport styles and should reject orphan parts', async ({
    render,
    root,
    run,
  }) => {
    await render('noInlineViewportStyle');
    const viewport = root.locator('[data-slot="scroll-area-viewport"]');

    await expect(viewport).toHaveCount(1);
    await expect(viewport).not.toHaveAttribute('style');
    expect(await run<string | null>('orphanViewportError')).toMatch(
      /called during component render/
    );
  });

  test('should expose viewport and scrollbar accessibility semantics given vertical and horizontal orientations when the area mounts', async ({
    render,
    root,
  }) => {
    await render('orientationSemantics');
    const viewport = root.locator('[data-slot="scroll-area-viewport"]');
    const bars = root.locator('[data-slot="scroll-area-scrollbar"]');

    await expect(viewport).toHaveAttribute('role', 'region');
    await expect(bars).toHaveCount(2);
    const viewportId = await viewport.getAttribute('id');
    expect(viewportId).toBeTruthy();
    const semantics = await bars.evaluateAll((nodes) =>
      nodes.map((node) => ({
        role: node.getAttribute('role'),
        orientation: node.getAttribute('aria-orientation'),
        controls: node.getAttribute('aria-controls'),
      }))
    );
    expect(semantics.map((bar) => bar.role)).toEqual(['scrollbar', 'scrollbar']);
    expect(semantics.map((bar) => bar.orientation)).toEqual([
      'vertical',
      'horizontal',
    ]);
    expect(semantics.every((bar) => bar.controls === viewportId)).toBe(true);
  });

  test('should preserve consumer scroll handlers and refs given ScrollAreaViewport asChild when the viewport rerenders', async ({
    render,
    root,
    run,
  }) => {
    await render('asChildViewport');

    await root.locator('[data-slot="scroll-area-viewport"]').dispatchEvent('scroll');

    expect(await run<boolean>('refIsViewport')).toBe(true);
    expect(await run<number>('scrollCalls')).toBe(1);
  });

  test('should synchronize range state and keyboard scrolling given overflow', async ({
    render,
    root,
  }) => {
    await render('overflowMetrics');
    const viewport = root.locator('[data-slot="scroll-area-viewport"]');
    const bars = root.locator('[data-slot="scroll-area-scrollbar"]');
    const vertical = bars.nth(0);
    const scrollTop = () => viewport.evaluate((node) => node.scrollTop);

    await viewport.dispatchEvent('scroll');

    await expect(bars).toHaveCount(2);
    expect(await vertical.getAttribute('id')).not.toBe(
      await bars.nth(1).getAttribute('id')
    );
    await expect(vertical).toHaveAttribute('aria-valuemin', '0');
    await expect(vertical).toHaveAttribute('aria-valuemax', '100');
    await expect(vertical).toHaveAttribute('aria-valuenow', '0');
    expect(await vertical.evaluate((node) => node.tabIndex)).toBe(0);

    await vertical.press('ArrowDown');
    await expect.poll(async () => Math.round(await scrollTop())).toBe(40);
    await expect(vertical).toHaveAttribute('aria-valuenow', '10');

    await vertical.press('End');
    await expect.poll(scrollTop).toBe(400);
    await expect(vertical).toHaveAttribute('aria-valuenow', '100');
  });
});
