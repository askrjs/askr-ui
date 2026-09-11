import { expect, test } from '../../fixtures';

test.describe('ProgressCircle - Behavior', () => {
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
