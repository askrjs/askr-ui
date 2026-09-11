import { expect, test } from '../../fixtures';

test.describe('Menubar - Accessibility', () => {
  test('should have no automated axe violations given open menubar content', async ({
    render,
    run,
    axeViolations,
  }) => {
    await render('axeOpenMenubar');
    await run('openFileMenu');

    expect(await axeViolations()).toEqual([]);
  });
});
