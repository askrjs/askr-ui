import { expect, test } from '../../fixtures';

/** The `it.each` table of the vitest original, one entry per generated title. */
const NON_FINITE_MAXIMA = [
  { label: 'Infinity', key: 'positiveInfinity' },
  { label: '-Infinity', key: 'negativeInfinity' },
  { label: 'NaN', key: 'nan' },
] as const;

test.describe('Progress - Behavior', () => {
  test('should expose progressbar metadata and indicator percentage', async ({
    render,
    run,
  }) => {
    await render('progressMetadata');

    expect(
      await run<{ valueNow: string; indicatorPercentage: string }>('metadata')
    ).toEqual({ valueNow: '40', indicatorPercentage: '50' });
  });

  test('should expose --ak-progress-percentage without an inline style attribute', async ({
    render,
    run,
  }) => {
    await render('percentageCustomProperty');

    expect(
      await run<{ styleAttribute: string | null; percentage: string }>(
        'styling'
      )
    ).toEqual({ styleAttribute: null, percentage: '50%' });
  });

  for (const { label, key } of NON_FINITE_MAXIMA) {
    test(`should normalize non-finite max ${label} to the default ARIA maximum`, async ({
      render,
      run,
    }) => {
      await render('nonFiniteMax', { key });

      expect(await run<string>('valueMax')).toBe('100');
    });
  }
});
