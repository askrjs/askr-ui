import { expect, test } from '../../fixtures';

test.describe('Table - Behavior', () => {
  test('should render semantic table elements by default', async ({
    render,
    root,
  }) => {
    await render('semanticElements');

    await expect(root.locator('table')).toHaveAttribute('data-slot', 'table');
    await expect(root.locator('caption')).toHaveText('Users');
    await expect(root.locator('thead')).toHaveCount(1);
    await expect(root.locator('tbody')).toHaveCount(1);
    await expect(root.locator('tfoot')).toHaveCount(1);
    await expect(root.locator('th')).toHaveCount(2);
    await expect(root.locator('td')).toHaveCount(3);
  });

  test('should support asChild composition on the root and cells', async ({
    render,
    root,
  }) => {
    await render('asChildComposition');

    await expect(root.locator('table')).toHaveAttribute('data-slot', 'table');
    await expect(root.locator('tr')).toHaveAttribute('data-slot', 'table-row');
    await expect(root.locator('td')).toHaveAttribute('data-slot', 'table-cell');
    await expect(root.locator('td')).toHaveText('Alice');
  });

  test('should preserve caption and header data attributes for theming', async ({
    render,
    root,
  }) => {
    await render('themingDataAttributes');

    await expect(root.locator('caption')).toHaveAttribute(
      'data-table-caption',
      'true'
    );
    await expect(root.locator('thead')).toHaveAttribute(
      'data-table-head',
      'true'
    );
    await expect(root.locator('th')).toHaveAttribute(
      'data-table-header-cell',
      'true'
    );
  });
});
