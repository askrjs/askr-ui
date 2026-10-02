import { expect, test } from '../../fixtures';

test('should dismiss the last opened persistent dialog before the later mounted dialog', async ({
  render,
  run,
  page,
  root,
}) => {
  await render('persistentDialogs');
  await run('openFirst');
  const first = page.locator('[id="dialog-first-content"]');
  const second = page.locator('[id="dialog-second-content"]');
  await expect(first.getByRole('button')).toBeFocused();
  const firstZ = await first.evaluate((node) =>
    Number(getComputedStyle(node).zIndex)
  );
  const secondZ = await second.evaluate((node) =>
    Number(getComputedStyle(node).zIndex)
  );
  expect(firstZ).toBeGreaterThan(secondZ);
  await page.keyboard.press('Escape');
  await expect(
    root.getByRole('button', { name: 'First', exact: true })
  ).toHaveAttribute('aria-expanded', 'false');
  await expect(
    root.getByRole('button', { name: 'Second', exact: true })
  ).toHaveAttribute('aria-expanded', 'true');
});

for (const persistent of [false, true]) {
  test(`should focus iframe content and restore it when ${persistent ? 'persistent content closes' : 'the scope unmounts'}`, async ({
    render,
    run,
    page,
  }) => {
    await render('iframeFocus', { persistent });
    const frame = page.frameLocator('iframe');
    if (persistent) {
      await frame.getByRole('button', { name: 'Preview' }).focus();
      await run('open');
    }
    const first = frame.getByRole('button', { name: 'First', exact: true });
    const last = frame.getByRole('button', { name: 'Last', exact: true });
    await expect(first).toBeFocused();
    if (!persistent) {
      await last.focus();
      await page.keyboard.press('Tab');
      await expect(first).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(last).toBeFocused();
    }
    await run('close');
    await expect(
      frame.getByRole('button', {
        name: persistent ? 'Preview' : 'Before',
        exact: true,
      })
    ).toBeFocused();
  });
}

test('should release tooltip focus listeners after each rerendered focus cycle', async ({
  render,
  run,
  root,
}) => {
  await render('tooltipListeners');
  try {
    const trigger = root.getByRole('button', { name: 'Hint' });
    for (let cycle = 0; cycle < 3; cycle++) {
      await trigger.focus();
      await run('rerender');
      await run('rerender');
      await trigger.evaluate((node: HTMLElement) => node.blur());
      await expect.poll(() => run<number>('listenerCount')).toBe(0);
    }
  } finally {
    await run('restore');
  }
});
