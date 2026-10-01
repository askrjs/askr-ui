import { expect, test } from '../../fixtures';

test.describe('DismissableLayer - Behavior', () => {
  test('should dismiss on Escape for the mounted layer', async ({
    render,
    root,
    run,
  }) => {
    await render('singleLayer');

    // The layer holds no focusable content, so the Escape is dispatched on the
    // layer element itself: this case is about an Escape targeting the layer.
    await root
      .locator('[data-dismissable-layer="true"]')
      .dispatchEvent('keydown', { bubbles: true, key: 'Escape' });

    expect(await run<number>('dismissCount')).toBe(1);
  });

  test('should dismiss on document Escape for the top layer', async ({
    page,
    render,
    run,
  }) => {
    await render('singleLayer');

    await page.keyboard.press('Escape');

    expect(await run<number>('dismissCount')).toBe(1);
  });

  test('should let an unconsumed Escape reach unrelated document handlers', async ({
    render,
    root,
    run,
  }) => {
    await render('preventedEscape');

    await root.getByRole('button', { name: 'Layer control' }).press('Escape');

    expect(await run<number>('dismissCount')).toBe(0);
    expect(await run<number>('globalEscapeCount')).toBe(1);
  });

  test('should dismiss on outside pointer down', async ({
    render,
    root,
    run,
  }) => {
    await render('singleLayer');

    await root.getByTestId('outside').click();

    expect(await run<number>('dismissCount')).toBe(1);
  });

  test('should honor prevented outside pointer dismissals', async ({
    render,
    root,
    run,
  }) => {
    await render('preventedPointerOutside');

    await root.getByTestId('outside').click();

    expect(await run<number>('dismissCount')).toBe(0);
  });

  test('should dismiss only the top layer when layers are stacked', async ({
    render,
    root,
    run,
  }) => {
    await render('stackedLayers');

    await root
      .locator('[data-dismissable-layer="true"]')
      .nth(1)
      .dispatchEvent('keydown', { bubbles: true, key: 'Escape' });

    expect(await run('counts')).toEqual({ inner: 1, outer: 0 });
  });

  test('should not dismiss when layer is disabled', async ({
    render,
    root,
    run,
  }) => {
    await render('disabledLayer');

    await root
      .locator('[data-dismissable-layer="true"]')
      .dispatchEvent('keydown', { bubbles: true, key: 'Escape' });

    expect(await run<number>('dismissCount')).toBe(0);
  });

  test('should delete per-ID registry entries after unmount', async ({
    render,
    run,
  }) => {
    await render('registryChurn');

    const { baseline, after } = await run<{ baseline: number; after: number }>(
      'churn'
    );

    expect(after).toBe(baseline);
  });

  test('should isolate layers with the same explicit ID across mount roots', async ({
    page,
    render,
    run,
  }) => {
    await render('sharedIdAcrossRoots');

    await run('unmountSecond');
    await page.keyboard.press('Escape');

    expect(await run('counts')).toEqual({ first: 1, second: 0 });
  });
});
