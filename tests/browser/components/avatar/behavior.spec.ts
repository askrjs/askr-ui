import { expect, test } from '../../fixtures';

test.describe('Avatar - Behavior', () => {
  test('should keep fallback visible until image load event', async ({
    render,
    root,
    run,
  }) => {
    await render('fallbackUntilLoad');
    const fallbackSelector = await run<string>('fallbackSelector');

    await expect(root.locator(fallbackSelector)).toHaveText('JD');

    await run('dispatchLoad');

    await expect(root.locator(fallbackSelector)).toHaveCount(0);
  });
});
