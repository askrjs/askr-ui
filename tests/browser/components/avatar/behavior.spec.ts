import { expect, test } from '../../fixtures';

test.describe('Avatar - Behavior', () => {
  test('should keep fallback visible until image load event', async ({
    render,
    root,
    page,
    run,
  }) => {
    let releaseImage!: () => Promise<void>;
    await page.route('**/avatar.png', async (route) => {
      await new Promise<void>((resolve) => {
        releaseImage = async () => {
          await route.fulfill({
            status: 200,
            contentType: 'image/gif',
            body: Buffer.from(
              'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
              'base64'
            ),
          });
          resolve();
        };
      });
    });

    await render('fallbackUntilLoad');
    const fallbackSelector = await run<string>('fallbackSelector');

    await expect(root.locator(fallbackSelector)).toHaveText('JD');

    await releaseImage();

    await expect(root.locator(fallbackSelector)).toHaveCount(0);
  });
});
