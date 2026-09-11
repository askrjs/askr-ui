import { expect, test } from '../../fixtures';

test.describe('VirtualList - Accessibility', () => {
  test('should have no automated axe violations for a semantic virtual list', async ({
    render,
    axeViolations,
  }) => {
    await render('axeSemanticList');

    expect(await axeViolations()).toEqual([]);
  });
});
