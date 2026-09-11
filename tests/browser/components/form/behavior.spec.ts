import { expect, test } from '../../fixtures';

test.describe('Form - Behavior', () => {
  test('should render a canonical form surface by default', async ({
    render,
    root,
  }) => {
    await render('canonicalSurface');
    const form = root.locator('form');

    await expect(form).toHaveAttribute('data-slot', 'form');
    await expect(form).toHaveAttribute('method', 'post');
  });

  test('should support asChild composition for non-form hosts', async ({
    render,
    root,
  }) => {
    await render('asChildComposition');

    await expect(root.locator('section')).toHaveAttribute('data-slot', 'form');
  });

  test('should submit and reset native controls given Form defaults when submit and reset events occur', async ({
    render,
    run,
  }) => {
    await render('submitAndReset');
    await run('dispatch');

    expect(await run<{ submit: number; reset: number }>('counts')).toEqual({
      submit: 1,
      reset: 1,
    });
  });

  test('should preserve form attributes given Form asChild when method, action, target, and encoding props are supplied', async ({
    render,
    root,
  }) => {
    await render('asChildFormAttributes');
    const section = root.locator('section');

    await expect(section).toHaveAttribute('method', 'post');
    await expect(section).toHaveAttribute('action', '/save');
    await expect(section).toHaveAttribute('target', '_blank');
    await expect(section).toHaveAttribute('enctype', 'multipart/form-data');
  });
});
