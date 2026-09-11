import { expect, test } from '../../fixtures';

test.describe('Label - Behavior', () => {
  test('should render a native label by default', async ({ render, root }) => {
    await render('nativeDefault');
    const label = root.locator('label');

    await expect(label).toHaveCount(1);
    await expect(label).toHaveText('Email');
    await expect(label).toHaveAttribute('for', 'email');
    await expect(label).toHaveAttribute('data-slot', 'label');
  });

  test('should support asChild composition and merge host props', async ({
    render,
    root,
  }) => {
    await render('asChildComposition');
    const span = root.locator('span');

    await expect(span).toHaveText('Email');
    await expect(span).toHaveAttribute('data-testid', 'email-label');
    await expect(span).toHaveAttribute('data-from-label', 'yes');
    await expect(span).toHaveAttribute('data-from-child', 'yes');
    await expect(span).toHaveAttribute('data-slot', 'label');
  });
});
