import { expect, test } from '../../fixtures';

test.describe('OverlayHost - Accessibility', () => {
  test('should preserve the accessibility of a hosted overlay', async ({
    render,
    axeViolations,
  }) => {
    await render('axeHostedOverlay');

    expect(await axeViolations()).toEqual([]);
  });
});
