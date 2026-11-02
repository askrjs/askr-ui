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

  test('should preserve every child ref across asChild table parts', async ({
    render,
    run,
  }) => {
    await render('customAsChildHosts');

    expect(await run<Record<string, boolean>>('refStatus')).toEqual({
      'table-component': true,
      'table-child': true,
      'caption-component': true,
      'caption-child': true,
      'head-component': true,
      'head-child': true,
      'head-row-component': true,
      'head-row-child': true,
      'header-component': true,
      'header-child': true,
      'body-component': true,
      'body-child': true,
      'body-row-component': true,
      'body-row-child': true,
      'cell-component': true,
      'cell-child': true,
      'foot-component': true,
      'foot-child': true,
      'foot-row-component': true,
      'foot-row-child': true,
      'foot-cell-component': true,
      'foot-cell-child': true,
    });
  });

  test('should retain table roles when asChild uses nonsemantic hosts', async ({
    render,
    root,
  }) => {
    await render('customAsChildHosts');

    await expect(root.locator('[role="table"]')).toHaveCount(1);
    await expect(root.locator('[data-table-caption="true"]')).toHaveCount(1);
    await expect(
      root.locator('[data-table-caption="true"]')
    ).not.toHaveAttribute('role');
    await expect(root.locator('[role="table"]')).toHaveAttribute(
      'aria-label',
      'Users'
    );
    await expect(root.locator('[role="rowgroup"]')).toHaveCount(3);
    await expect(root.locator('[role="row"]')).toHaveCount(3);
    await expect(root.locator('[role="columnheader"]')).toHaveCount(1);
    await expect(root.locator('[role="cell"]')).toHaveCount(2);
  });

  test('should update a slotted header role when its scope changes', async ({
    render,
    run,
    root,
  }) => {
    await render('reactiveHeaderScope');

    await expect(root.locator('[role="columnheader"]')).toHaveCount(1);
    await run('setRow');
    await expect(root.locator('[role="rowheader"]')).toHaveCount(1);
  });
});
