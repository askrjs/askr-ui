import { expect, test } from '../../fixtures';

/** The `it.each` table of the vitest original, one entry per generated title. */
const NON_FINITE_MAXIMA = [
  { label: 'Infinity', key: 'positiveInfinity' },
  { label: '-Infinity', key: 'negativeInfinity' },
  { label: 'NaN', key: 'nan' },
] as const;

test.describe('Progress - Behavior', () => {
  test('should preserve child and caller refs on an asChild indicator', async ({
    render,
    run,
  }) => {
    await render('asChildIndicatorRefs');
    expect(await run('refsAttached')).toEqual({ child: true, caller: true });
  });

  test('should forward caller styles to the progress root', async ({
    render,
    run,
  }) => {
    await render('callerStyle');
    expect(await run('style')).toEqual({ color: 'red', marginTop: '8px' });
  });

  test('should keep progressbar semantics aligned with the computed value', async ({
    render,
    run,
  }) => {
    await render('stateAriaOverrides');
    expect(await run('metadata')).toEqual({
      role: 'progressbar',
      min: '0',
      max: '50',
      now: '25',
      text: '50%',
    });
  });

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
