import { captureFocusTarget } from '../../assertions';
import { expect, test } from '../../fixtures';

const modes = [
  { name: 'unzoomed control', html: 1, body: 1, trigger: 1, content: 1 },
  { name: 'root zoom 2', html: 2, body: 1, trigger: 1, content: 1 },
  { name: 'root zoom 0.75', html: 0.75, body: 1, trigger: 1, content: 1 },
  {
    name: 'nested root and body zoom',
    html: 1.6,
    body: 1.25,
    trigger: 1,
    content: 1,
  },
  { name: 'trigger-only zoom', html: 1, body: 1, trigger: 2, content: 1 },
  { name: 'content-only zoom', html: 1, body: 1, trigger: 1, content: 1.5 },
  {
    name: 'nested zoom without CSSOM accessor',
    html: 1.6,
    body: 1.25,
    trigger: 1,
    content: 1,
    fallback: true,
  },
] as const;

for (const mode of modes) {
  test(`should anchor a portal in content CSS coordinates: ${mode.name}`, async ({
    page,
    render,
    root,
  }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await render('anchored', mode);
    const trigger = root.locator('[data-zoom-trigger]');
    const checkTrigger = await captureFocusTarget(trigger);
    await trigger.focus();
    await expect(trigger).toBeFocused();
    await trigger.click();
    const content = page.getByRole('dialog', { name: 'Zoom details' });
    await expect(content).toBeVisible();
    await expect(content).toHaveAttribute('data-side', 'right');
    const contentZoom = mode.html * mode.body * mode.content;
    await expect
      .poll(() =>
        content.evaluate((node, zoom) => {
          const trigger = document.querySelector('[data-zoom-trigger]')!;
          return Math.abs(
            node.getBoundingClientRect().left -
              trigger.getBoundingClientRect().right -
              8 * zoom
          );
        }, contentZoom)
      )
      .toBeLessThanOrEqual(2);
    await expect
      .poll(() =>
        content.evaluate((node) =>
          Math.abs(
            node.getBoundingClientRect().top -
              document
                .querySelector('[data-zoom-trigger]')!
                .getBoundingClientRect().top
          )
        )
      )
      .toBeLessThanOrEqual(2);
    expect(
      await content.evaluate((node) =>
        document.querySelector('[data-zoom-authoring-branch]')!.contains(node)
      )
    ).toBe(false);
    await expect(content).not.toHaveAttribute('style');
    await expect
      .poll(() =>
        content.evaluate((node) =>
          getComputedStyle(node)
            .getPropertyValue('--ak-overlay-available-width')
            .trim()
        )
      )
      .toBe(`${Math.round(1000 / contentZoom - 24)}px`);
    await page.keyboard.press('Escape');
    await expect(content).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await checkTrigger();
  });
}

for (const fallback of [false, true]) {
  test(`should supply content CSS sizes for a constrained zoomed popup (fallback ${fallback})`, async ({
    page,
    render,
    root,
  }) => {
    await page.setViewportSize({ width: 390, height: 300 });
    await render('anchored', { html: 2, oversized: true, fallback });
    const trigger = root.locator('[data-zoom-trigger]');
    await trigger.focus();
    await expect(trigger).toBeFocused();
    await trigger.click();
    const content = page.getByRole('dialog', { name: 'Zoom details' });
    await expect(content).toBeVisible();
    await expect
      .poll(() =>
        content.evaluate((node) => {
          const { left, top, right, bottom } = node.getBoundingClientRect();
          return (
            left >= 23 &&
            top >= 23 &&
            right <= innerWidth - 23 &&
            bottom <= innerHeight - 23
          );
        })
      )
      .toBe(true);
    await expect(content).toHaveCSS('max-width', '171px');
    await expect(content).toHaveCSS('max-height', '126px');
    await page.keyboard.press('Escape');
    await expect(content).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}

for (const mode of modes.filter((mode) => mode.trigger === 1)) {
  test(`should center a dialog in content CSS coordinates: ${mode.name}`, async ({
    page,
    render,
    root,
  }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await render('centered', mode);
    const trigger = root.locator('[data-zoom-trigger]');
    const checkTrigger = await captureFocusTarget(trigger);
    await trigger.focus();
    await expect(trigger).toBeFocused();
    await trigger.click();
    const content = page.getByRole('dialog', { name: 'Zoom preferences' });
    await expect(content).toBeVisible();
    await expect
      .poll(() =>
        content.evaluate((node) => {
          const rect = node.getBoundingClientRect();
          return Math.max(
            Math.abs(rect.left + rect.width / 2 - innerWidth / 2),
            Math.abs(rect.top + rect.height / 2 - innerHeight / 2)
          );
        })
      )
      .toBeLessThanOrEqual(2);
    await expect(content).not.toHaveAttribute('style');
    await page.keyboard.press('Escape');
    await expect(content).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await checkTrigger();
  });
}

for (const mode of modes.filter((mode) =>
  ['root zoom 2', 'trigger-only zoom', 'content-only zoom'].includes(mode.name)
)) {
  test(`should match a Select trigger's visual width once: ${mode.name}`, async ({
    page,
    render,
    root,
  }) => {
    await page.setViewportSize({ width: 1000, height: 800 });
    await render('matchedWidth', mode);
    const trigger = root.getByRole('button', { name: 'Zoom choice' });
    await trigger.focus();
    await expect(trigger).toBeFocused();
    await trigger.click();
    const content = page.getByRole('listbox');
    await expect(content).toBeVisible();
    await expect
      .poll(() =>
        content.evaluate((node) =>
          Math.abs(
            node.getBoundingClientRect().width -
              document
                .querySelector('[data-zoom-trigger]')!
                .getBoundingClientRect().width
          )
        )
      )
      .toBeLessThanOrEqual(2);
    await page.keyboard.press('Escape');
    await expect(content).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
}
