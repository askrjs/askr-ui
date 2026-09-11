import { expect, test } from '../../fixtures';

test.describe('OverlayHost - Behavior', () => {
  test('should retain independent portal channels when one overlay closes', async ({
    render,
    run,
  }) => {
    await render('independentPortalChannels');

    expect(await run<number>('contentCount')).toBe(2);

    await run('closeFirst');

    expect(
      await run<{ first: boolean; second: boolean }>('overlays')
    ).toEqual({ first: false, second: true });
  });

  test('should remove hosted portal content when the application host unmounts', async ({
    render,
    run,
  }) => {
    await render('hostUnmount');

    expect(await run<boolean>('hasHostedContent')).toBe(true);

    await run('unmountHost');

    expect(await run<boolean>('hasHostedContent')).toBe(false);

    await run('mountReplacement');
  });
});
