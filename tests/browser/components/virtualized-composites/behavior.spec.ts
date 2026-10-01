import { expect, test } from '../../fixtures';
import type { Run } from '../../fixtures';

const FIXTURES = [
  { name: 'ToggleGroup', key: 'ArrowDown' },
  { name: 'RadioGroup', key: 'ArrowDown' },
  { name: 'Menu', key: 'ArrowDown' },
  { name: 'Select', key: 'ArrowDown' },
  { name: 'Dropdown', key: 'ArrowDown' },
  { name: 'Menubar', key: 'ArrowRight' },
] as const;

/**
 * Reads the list viewport's window start and the focused item's text together,
 * so one `expect.poll` waits for both the scroll-into-view and the focus move.
 */
async function windowedNavigation(run: Run) {
  const { visibleStartIndex, activeText } = await run<{
    visibleStartIndex: number;
    activeText: string | null;
  }>('navigation');
  return { startsBeyond40: visibleStartIndex > 40, activeText };
}

test.describe('virtualized composite navigation', () => {
  for (const fixture of FIXTURES) {
    test(`should preserve dataset indices and advance ${fixture.name} focus beyond the mounted window`, async ({
      page,
      render,
      run,
    }) => {
      await render('compositeBeyondWindow', { name: fixture.name });

      const overflow = await run<{
        scrollHeight: number;
        clientHeight: number;
      }>('overflow');
      expect(overflow.scrollHeight).toBeGreaterThan(overflow.clientHeight);
      expect(await run<number>('scrollTo', 800)).toBeGreaterThanOrEqual(799);

      expect(await run<string | null>('rovingIndex', 'Item 42')).toBe('42');
      await run('click', 'Item 42');
      expect(await run<string | null>('focus', 'Item 42')).toBe('Item 42');
      await page.keyboard.press(fixture.key);

      await expect
        .poll(() => windowedNavigation(run))
        .toEqual({ startsBeyond40: true, activeText: 'Item 43' });
    });
  }

  test('should preserve dataset indices inside a virtualized Menubar menu surface', async ({
    page,
    render,
    run,
  }) => {
    await render('menubarMenuSurface');

    await run('openMenu');
    await run('scrollTo', 800);

    expect(await run<string | null>('lastRenderedIndex')).toBe('42');
    await run('focusFirstRendered');
    for (let step = 0; step < 3; step += 1) {
      await page.keyboard.press('ArrowDown');
    }

    await expect
      .poll(() => windowedNavigation(run))
      .toEqual({ startsBeyond40: true, activeText: 'Item 43' });
  });

  test('should derive composite placement and restore off-window focus through VirtualTable rows', async ({
    page,
    render,
    run,
  }) => {
    await render('virtualTableRows');

    await run('scrollTo', 820);

    const rendered =
      await run<Array<{ text: string | null; index: string | null }>>(
        'rendered'
      );
    expect(rendered.length).toBeGreaterThan(0);
    for (const item of rendered) {
      expect(item.text).toBe(`Item ${item.index}`);
    }
    const targetIndex = Number(rendered.at(-1)!.index);

    await run('clickIndex', targetIndex);
    expect(await run<string | null>('focusIndex', targetIndex)).toBe(
      `Item ${targetIndex}`
    );
    await page.keyboard.press('ArrowDown');

    await expect
      .poll(async () => {
        const { scrollTop, activeText } = await run<{
          scrollTop: number;
          activeText: string | null;
        }>('navigation');
        return { scrolledPast820: scrollTop > 820, activeText };
      })
      .toEqual({
        scrolledPast820: true,
        activeText: `Item ${targetIndex + 1}`,
      });
  });

  test('should not leak a virtual row index into a composite owned by that row', async ({
    render,
    run,
  }) => {
    await render('rowOwnedComposite');

    await run('scrollTo', 800);

    const rows = await run<string[][]>('rowIndices');
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row).toEqual(['0', '1']);
    }
  });
});
