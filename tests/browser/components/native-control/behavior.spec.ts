import { expect, test } from '../../fixtures';

test.describe('Native control styling', () => {
  test('should mark representative native button fallbacks without inline styles', async ({
    render,
    run,
  }) => {
    await render('nativeFallbacks');

    expect(
      await run<
        Record<string, { nativeControl: string | null; style: string | null }>
      >('controls')
    ).toEqual({
      button: { nativeControl: 'true', style: null },
      'menu-item': { nativeControl: 'true', style: null },
      'select-trigger': { nativeControl: 'true', style: null },
      toggle: { nativeControl: 'true', style: null },
    });
  });

  test('should preserve caller font overrides and leave asChild typography untouched', async ({
    render,
    run,
  }) => {
    await render('fontOverrides');

    expect(
      await run<{
        overrideFontSize: string;
        asChildFontSize: string;
        asChildFontShorthand: string;
      }>('typography')
    ).toEqual({
      overrideFontSize: '21px',
      asChildFontSize: '19px',
      asChildFontShorthand: '',
    });
  });
});
