import { expect, test } from '../../fixtures';

test.describe('ProgressCircle - Behavior', () => {
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

  test('should expose circular progress metadata', async ({ render, run }) => {
    await render('circularMetadata');

    expect(await run<string>('valueNow')).toBe('30');
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
});
