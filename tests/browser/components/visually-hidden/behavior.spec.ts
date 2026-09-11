import { expect, test } from '../../fixtures';

test.describe('VisuallyHidden — Behavior', () => {
  test('should render a hidden span by default', async ({ render, root }) => {
    await render('hiddenSpanDefault');
    const span = root.locator('span');

    expect(
      await span.evaluate((node: HTMLElement) => node.textContent)
    ).toBe('Hidden text');
    await expect(span).toHaveAttribute('data-askr-visually-hidden', 'true');
  });

  test('should support asChild composition', async ({ render, root }) => {
    await render('asChildComposition');

    await expect(root.locator('strong')).toHaveAttribute(
      'data-askr-visually-hidden',
      'true'
    );
  });
});
