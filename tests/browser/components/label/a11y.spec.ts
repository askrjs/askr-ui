import { expect, test } from '../../fixtures';

test.describe('Label - Accessibility', () => {
  test('should have no automated axe violations given labelled form control', async ({
    render,
    axeViolations,
  }) => {
    await render('axeLabelledControl');

    expect(await axeViolations()).toEqual([]);
  });

  test('should preserve htmlFor linkage on native label', async ({
    render,
    run,
  }) => {
    await render('htmlForLinkage');

    expect(await run<string>('association')).toBe('email');
  });

  test('should match the documented label accessibility contract', async ({
    render,
    run,
  }) => {
    await render('contract');
    const contract = await run<Record<string, unknown>>('contract');

    expect(contract.ELEMENT).toBe('label');
    expect(contract.ASSOCIATION_ATTRIBUTE).toBe('for');
    expect(contract.DATA_ATTRIBUTES).toEqual({
      slot: 'data-slot',
    });
    expect(contract.AS_CHILD).toEqual({
      forwardsProps: true,
      preservesChildElement: true,
    });
  });
});
