import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../../fixtures';

/** Presses and releases the real mouse at `fraction` of the track's width. */
async function pressTrackAt(
  page: Page,
  track: Locator,
  fraction: number
): Promise<void> {
  const box = await track.boundingBox();
  if (!box) throw new Error('slider track has no layout box');
  await page.mouse.click(box.x + box.width * fraction, box.y + box.height / 2);
}

test.describe('Slider - Behavior', () => {
  test('should update value from pointer and keyboard input', async ({
    page,
    render,
    root,
  }) => {
    await render('pointerAndKeyboard');
    const track = root.locator('[data-slider-track="true"]');
    const thumb = root.getByRole('slider');
    const input = root.locator('input[type="hidden"]');

    await pressTrackAt(page, track, 0.8);

    await expect(thumb).toHaveAttribute('aria-valuenow', '80');
    await expect(input).toHaveValue('80');

    await thumb.press('ArrowRight');
    await expect(input).toHaveValue('81');
    await expect(thumb).toHaveAttribute('aria-valuenow', '81');
    await expect(track).toHaveAttribute('data-percentage', '81');
  });

  test('should update value while the thumb is dragged and stop on release', async ({
    page,
    render,
    root,
  }) => {
    await render('pointerAndKeyboard');
    const track = root.locator('[data-slider-track="true"]');
    const thumb = root.getByRole('slider');
    const input = root.locator('input[type="hidden"]');

    const trackBox = await track.boundingBox();
    const thumbBox = await thumb.boundingBox();
    if (!trackBox || !thumbBox) throw new Error('slider has no layout box');
    const y = trackBox.y + trackBox.height / 2;

    await page.mouse.move(thumbBox.x + thumbBox.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(trackBox.x + trackBox.width * 0.6, y, { steps: 8 });

    await expect(thumb).toHaveAttribute('aria-valuenow', '60');
    await expect(input).toHaveValue('60');

    await page.mouse.up();
    await page.mouse.move(trackBox.x + trackBox.width * 0.9, y, { steps: 4 });

    await expect(input).toHaveValue('60');
  });

  test('should keep pointer input working and forward the caller ref given a track ref', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('callerTrackRef');

    expect(await run<boolean>('refIsTrack')).toBe(true);

    await pressTrackAt(page, root.locator('[data-slider-track="true"]'), 0.7);
    await expect(root.locator('input[type="hidden"]')).toHaveValue('70');
  });

  test('should update value from pointer input given an asChild track', async ({
    page,
    render,
    root,
  }) => {
    await render('asChildTrack');
    const track = root.locator('section[data-slider-track="true"]');

    await pressTrackAt(page, track, 0.4);
    await expect(root.locator('input[type="hidden"]')).toHaveValue('40');
  });

  test('should reverse horizontal pointer and arrow semantics in RTL', async ({
    page,
    render,
    root,
  }) => {
    await render('rtl');
    const input = root.locator('input');

    await pressTrackAt(page, root.locator('[data-slider-track]'), 0.8);
    await expect(input).toHaveValue('20');

    await root.getByRole('slider').press('ArrowLeft');
    await expect(input).toHaveValue('21');
  });

  test('should restore its uncontrolled value when its native form resets', async ({
    render,
    root,
    run,
  }) => {
    await render('formReset');
    const input = root.locator('input');

    await root.getByRole('slider').press('ArrowRight');
    await expect(input).toHaveValue('21');

    await run('reset');
    await expect(input).toHaveValue('20');
    expect(await run<number[][]>('calls')).toEqual([[21], [20]]);
  });

  test('should expose --ak-slider-percentage without an inline style attribute', async ({
    render,
    root,
  }) => {
    await render('percentageVariable');
    const slider = root.locator('[data-slot="slider"]');

    await expect(slider).not.toHaveAttribute('style');
    expect(
      await slider.evaluate((node) =>
        getComputedStyle(node).getPropertyValue('--ak-slider-percentage').trim()
      )
    ).toBe('25%');
  });

  test('should remove active drag listeners when unmounted mid-drag', async ({
    page,
    render,
    root,
    run,
  }) => {
    await render('unmountMidDrag');
    const box = await root.locator('[data-slider-track="true"]').boundingBox();
    if (!box) throw new Error('slider track has no layout box');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();

    const removed = await run<string[]>('unmountAndCollectRemovedListeners');
    await page.mouse.up();

    expect(removed).toEqual(
      expect.arrayContaining(['pointermove', 'pointerup'])
    );
  });

  test('should support Home/End/PageUp/PageDown keyboard boundaries', async ({
    render,
    root,
  }) => {
    await render('keyboardBoundaries');
    const thumb = root.getByRole('slider');
    const input = root.locator('input[type="hidden"]');

    await thumb.press('PageUp');
    await expect(input).toHaveValue('100');
    await expect(thumb).toHaveAttribute('aria-valuenow', '100');

    await thumb.press('End');
    await expect(input).toHaveValue('100');

    await thumb.press('PageDown');
    await expect(input).toHaveValue('50');
    await expect(thumb).toHaveAttribute('aria-valuenow', '50');

    await thumb.press('Home');
    await expect(input).toHaveValue('0');
    await expect(thumb).toHaveAttribute('aria-valuenow', '0');
  });

  test('should ignore pointer and keyboard updates when disabled', async ({
    page,
    render,
    root,
  }) => {
    await render('disabled');
    const thumb = root.getByRole('slider');
    const input = root.locator('input[type="hidden"]');

    await pressTrackAt(page, root.locator('[data-slider-track="true"]'), 0.9);
    await thumb.dispatchEvent('keydown', { key: 'ArrowRight', bubbles: true });

    await expect(input).toHaveValue('30');
    await expect(thumb).toHaveAttribute('aria-valuenow', '30');
    await expect(thumb).toHaveAttribute('aria-disabled', 'true');
    expect(
      await input.evaluate((node: HTMLInputElement) => node.disabled)
    ).toBe(true);
  });
});

test('should suppress pointer movement after disabling an active slider drag', async ({
  page,
  render,
  root,
  run,
}) => {
  await render('dragLifecycle');
  const track = root.locator('[data-slider-track]');
  const rect = (await track.boundingBox())!;
  await page.mouse.move(rect.x + rect.width * 0.2, rect.y + rect.height / 2);
  await page.mouse.down();
  await run('disable');
  await page.mouse.move(rect.x + rect.width * 0.8, rect.y + rect.height / 2);
  await page.mouse.up();
  await expect(root.locator('[role="slider"]')).toHaveAttribute(
    'aria-valuenow',
    '20'
  );
  expect(await run('changes')).toEqual([]);
});

test('should stop updating after native pointercancel ends a slider drag', async ({
  page,
  render,
  root,
  run,
}) => {
  await render('dragLifecycle');
  const track = root.locator('[data-slider-track]');
  const rect = (await track.boundingBox())!;
  await page.mouse.move(rect.x + rect.width * 0.2, rect.y + rect.height / 2);
  await page.mouse.down();
  await track.dispatchEvent('pointercancel', {
    pointerId: 1,
    pointerType: 'mouse',
    bubbles: true,
  });
  await page.mouse.move(rect.x + rect.width * 0.8, rect.y + rect.height / 2);
  await page.mouse.up();
  await expect(root.locator('[role="slider"]')).toHaveAttribute(
    'aria-valuenow',
    '20'
  );
  expect(await run('changes')).toEqual([]);
});
