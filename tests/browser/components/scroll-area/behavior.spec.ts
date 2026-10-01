import { expect, test } from '../../fixtures';

test.describe('ScrollArea - Behavior', () => {
  test('should expose canonical viewport and scrollbar hooks', async ({
    render,
    root,
  }) => {
    await render('canonicalHooks');

    await expect(
      root.locator('[data-slot="scroll-area-viewport"]')
    ).toHaveCount(1);
    await expect(
      root.locator('[data-slot="scroll-area-scrollbar"]')
    ).toHaveCount(1);
    await expect(root.locator('[data-slot="scroll-area-thumb"]')).toHaveCount(
      1
    );
    await expect(root.locator('[data-slot="scroll-area-corner"]')).toHaveCount(
      1
    );
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
    expect(semantics.map((bar) => bar.role)).toEqual([
      'scrollbar',
      'scrollbar',
    ]);
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

    await root
      .locator('[data-slot="scroll-area-viewport"]')
      .dispatchEvent('scroll');

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

test('RTL horizontal scrollbar publishes bounded values and reaches End', async ({
  page,
  render,
  root,
}) => {
  await render('rtlScrollbar');
  await page.addStyleTag({
    content:
      '[data-slot="scroll-area-viewport"]{width:100px;height:40px;overflow:auto}[data-review-wide]{width:600px;height:20px}',
  });
  const viewport = root.locator('[data-slot="scroll-area-viewport"]');
  const scrollbar = root.getByRole('scrollbar', { name: 'Horizontal' });
  await expect(scrollbar).toHaveAttribute('aria-disabled', 'false');
  await viewport.evaluate((node) => {
    node.scrollLeft = -100;
    node.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  expect(
    Number(await scrollbar.getAttribute('aria-valuenow'))
  ).toBeGreaterThanOrEqual(0);
  await scrollbar.focus();
  await scrollbar.press('End');
  expect(await viewport.evaluate((node) => node.scrollLeft)).toBe(-500);
  await expect(scrollbar).toHaveAttribute('aria-valuenow', '100');
  await scrollbar.press('Home');
  expect(await viewport.evaluate((node) => node.scrollLeft)).toBe(0);
  await expect(scrollbar).toHaveAttribute('aria-valuenow', '0');
  await scrollbar.press('ArrowLeft');
  expect(await viewport.evaluate((node) => node.scrollLeft)).toBe(-40);
  await scrollbar.press('ArrowRight');
  expect(await viewport.evaluate((node) => node.scrollLeft)).toBe(0);
  await scrollbar.press('PageDown');
  expect(await viewport.evaluate((node) => node.scrollLeft)).toBe(-100);
  await scrollbar.press('PageUp');
  expect(await viewport.evaluate((node) => node.scrollLeft)).toBe(0);
});

test('LTR horizontal scrollbar preserves range values and keyboard directions', async ({
  render,
  page,
  root,
}) => {
  await render('rtlScrollbar', { direction: 'ltr' });
  await page.addStyleTag({
    content:
      '[data-slot="scroll-area-viewport"]{width:100px;height:40px;overflow:auto}[data-review-wide]{width:600px;height:20px}',
  });
  const viewport = root.locator('[data-slot="scroll-area-viewport"]');
  const scrollbar = root.getByRole('scrollbar', { name: 'Horizontal' });
  await expect(scrollbar).toHaveAttribute('aria-disabled', 'false');
  await viewport.evaluate((node) => {
    node.scrollLeft = 100;
    node.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  await expect(scrollbar).toHaveAttribute('aria-valuenow', '20');
  await scrollbar.focus();
  for (const [key, position] of [
    ['End', 500],
    ['Home', 0],
    ['ArrowRight', 40],
    ['ArrowLeft', 0],
    ['PageDown', 100],
    ['PageUp', 0],
  ] as const) {
    await scrollbar.press(key);
    expect(await viewport.evaluate((node) => node.scrollLeft)).toBe(position);
  }
});

for (const cancellation of ['ancestor', 'caller'] as const) {
  test(`ScrollArea honors ${cancellation} keyboard cancellation`, async ({
    page,
    render,
    root,
  }) => {
    await render('cancelledKeyboard', { cancellation });
    const viewport = root.locator('[data-slot="scroll-area-viewport"]');
    const scrollbar = root.getByRole('scrollbar', { name: 'Vertical' });
    await expect(scrollbar).toHaveAttribute('aria-disabled', 'false');
    if (cancellation === 'ancestor') {
      await page.evaluate(() =>
        document.addEventListener(
          'keydown',
          (event) => event.preventDefault(),
          { capture: true }
        )
      );
    }
    await scrollbar.focus();
    await scrollbar.press('ArrowDown');
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)))
    );
    expect(await viewport.evaluate((node) => node.scrollTop)).toBe(0);
  });
}
