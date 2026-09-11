import { expect, test } from '../../fixtures';

interface Labeling {
  hasTrigger: boolean;
  hasContent: boolean;
  triggerId: string;
  contentLabelledBy: string | null;
}

test.describe('Popover - Accessibility', () => {
  test('should have no automated axe violations given default open popover', async ({
    render,
    axeViolations,
  }) => {
    await render('axeDefaultOpen');

    expect(await axeViolations()).toEqual([]);
  });

  test('should label dialog content from trigger by default', async ({
    render,
    run,
  }) => {
    await render('triggerLabeling');
    const labeling = await run<Labeling>('labeling');

    expect(labeling.hasTrigger).toBe(true);
    expect(labeling.hasContent).toBe(true);
    expect(labeling.triggerId).toBeTruthy();
    expect(labeling.contentLabelledBy).toBe(labeling.triggerId);
  });

  test('should allow explicit content labeling via aria-label', async ({
    render,
    run,
  }) => {
    await render('explicitAriaLabel');
    const content = await run<{
      hasContent: boolean;
      ariaLabel: string | null;
      hasLabelledBy: boolean;
    }>('content');

    expect(content.hasContent).toBe(true);
    expect(content.ariaLabel).toBe('Popover content');
    expect(content.hasLabelledBy).toBe(false);
  });
});
