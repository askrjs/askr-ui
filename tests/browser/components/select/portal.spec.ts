import { expect, test } from '../../fixtures';

test.describe('Select - Portal', () => {
  test('should render listbox content when the trigger opens', async ({
    render,
    page,
    root,
  }) => {
    await render();

    await root.getByRole('button', { name: 'Framework' }).click();

    await expect(
      root.getByRole('button', { name: 'Framework' })
    ).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page.getByRole('option', { name: 'Askr' })).toBeVisible();
  });
});
