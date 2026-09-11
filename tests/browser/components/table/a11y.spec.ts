import { expect, test } from '../../fixtures';

test.describe('Table - Accessibility', () => {
  test('should have no automated axe violations for a semantic table', async ({
    render,
    axeViolations,
  }) => {
    await render('axeSemanticTable');

    expect(await axeViolations()).toEqual([]);
  });
});
