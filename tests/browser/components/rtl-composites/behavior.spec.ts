import { expect, test } from '../../fixtures';

test.describe('RTL composite navigation', () => {
  test('should reverse horizontal roving focus for every composite consumer', async ({
    page,
    render,
    run,
  }) => {
    await render('horizontalRovingFocus');

    for (const [first, expected] of [
      ['Toggle A', 'Toggle C'],
      ['Radio A', 'Radio C'],
      ['Menu A', 'Menu C'],
      ['Menubar A', 'Menubar C'],
    ] as const) {
      await test.step(`${first} -> ${expected}`, async () => {
        await run('focusByText', first);
        await page.keyboard.press('ArrowRight');
        await run('flush');

        expect(await run<string | null>('activeText')).toBe(expected);
      });
    }
  });
});
