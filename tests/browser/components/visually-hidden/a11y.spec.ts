import { expect, test } from '../../fixtures';

test.describe('VisuallyHidden - Accessibility', () => {
  test('should have no automated axe violations given hidden accessible text', async ({
    render,
    axeViolations,
  }) => {
    await render('axeHiddenAccessibleText');

    expect(await axeViolations()).toEqual([]);
  });

  test('should apply hidden attributes to composed child', async ({
    render,
    run,
  }) => {
    await render('composedChild');

    expect(
      await run<{
        marker: string;
        styleAttribute: string | null;
        position: string;
      }>('hiddenState')
    ).toEqual({
      marker: 'true',
      styleAttribute: null,
      position: 'absolute',
    });
  });
});
