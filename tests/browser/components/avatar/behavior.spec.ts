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

test('should preserve fallback while replacement source is loading (Avatar)', async ({
  page,
  render,
  root,
  run,
}) => {
  let releaseFirst!: () => Promise<void>;
  let releaseSecond!: () => Promise<void>;
  for (const [url, setRelease] of [
    [
      '**/review-first.gif',
      (value: () => Promise<void>) => {
        releaseFirst = value;
      },
    ],
    [
      '**/review-second.gif',
      (value: () => Promise<void>) => {
        releaseSecond = value;
      },
    ],
  ] as const)
    await page.route(url, async (route) => {
      await new Promise<void>((resolve) => {
        setRelease(async () => {
          await route.fulfill({
            status: 200,
            contentType: 'image/gif',
            body: Buffer.from(
              'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
              'base64'
            ),
          });
          resolve();
        });
      });
    });
  await render('avatarLoadHandoff');
  await expect(root.locator('[data-avatar-fallback]')).toHaveText('FB');
  await expect.poll(() => typeof releaseFirst).toBe('function');
  await releaseFirst();
  await expect(root.locator('img')).toHaveAttribute(
    'src',
    '/review-second.gif'
  );
  await expect.poll(() => typeof releaseSecond).toBe('function');
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve(null)))
      )
  );
  await expect(root.locator('[data-avatar-fallback]')).toHaveText('FB');
  await releaseSecond();
  await expect(root.locator('[data-avatar-fallback]')).toHaveCount(0);
  expect(await run('statuses')).toEqual(['loaded', 'loaded']);
});
