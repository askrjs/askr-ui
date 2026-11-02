import { expect, test } from '../../fixtures';

test.describe('Table - Accessibility', () => {
  test('should have no automated axe violations for a semantic table', async ({
    render,
    axeViolations,
  }) => {
    await render('axeSemanticTable');

    expect(await axeViolations()).toEqual([]);
  });

  test('should retain an accessible table tree across nonsemantic asChild hosts', async ({
    render,
    axeViolations,
    root,
  }) => {
    await render('axeAsChildHosts');

    expect(await axeViolations()).toEqual([]);
    await expect(root.getByRole('table', { name: 'Users' })).toHaveCount(1);
    await expect(root.locator('[role="table"]')).toHaveAttribute(
      'aria-labelledby',
      'users-caption'
    );
  });

  test('should label an asChild table from its default caption', async ({
    render,
    axeViolations,
    root,
  }) => {
    await render('axeAsChildDefaultCaption');

    expect(await axeViolations()).toEqual([]);
    await expect(root.getByRole('table', { name: 'Users' })).toHaveCount(1);
  });

  test('should preserve native semantics when the asChild host is a table', async ({
    render,
    axeViolations,
    root,
  }) => {
    await render('axeAsChildNativeTable');

    expect(await axeViolations()).toEqual([]);
    await expect(root.getByRole('table', { name: 'Users' })).toHaveCount(1);
  });
});
