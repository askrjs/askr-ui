import { expect, test } from '../../fixtures';

test.describe('VirtualTable - Accessibility', () => {
  test('should have no automated axe violations for a selectable virtual grid', async ({
    render,
    axeViolations,
  }) => {
    await render('axeSelectableGrid');

    expect(await axeViolations()).toEqual([]);
  });
});
