import type { Page } from '@playwright/test';
import { expect, test } from '../../fixtures';

const CLOCK_START = new Date('2026-01-01T00:00:00Z');

async function installPausedClock(page: Page): Promise<void> {
  await page.clock.install({ time: CLOCK_START });
  await page.clock.pauseAt(CLOCK_START);
}

test.describe('Input - Behavior', () => {
  test('should render a native input by default', async ({ render, root }) => {
    await render('nativeDefault');
    const input = root.locator('input');

    await expect(input).toHaveAttribute('type', 'email');
    await expect(input).toHaveAttribute('placeholder', 'Email');
    await expect(input).toHaveAttribute('data-slot', 'input');
  });

  test('should apply disabled and readonly semantics to native inputs', async ({
    render,
    root,
  }) => {
    await render('nativeDisabledReadOnly');
    const input = root.locator('input');

    expect(
      await input.evaluate((node: HTMLInputElement) => node.disabled)
    ).toBe(true);
    await expect(input).toHaveAttribute('aria-disabled', 'true');
    await expect(input).toHaveAttribute('data-disabled', 'true');
    expect(
      await input.evaluate((node: HTMLInputElement) => node.readOnly)
    ).toBe(true);
    await expect(input).toHaveAttribute('readonly');
  });

  test('should support asChild composition and merge host props', async ({
    render,
    root,
  }) => {
    await render('asChildComposition');
    const input = root.locator('input');

    await expect(input).toHaveAttribute('data-testid', 'custom-input');
    await expect(input).toHaveAttribute('data-from-input', 'yes');
    await expect(input).toHaveAttribute('data-from-child', 'yes');
    await expect(input).toHaveAttribute('data-slot', 'input');
  });

  test('should apply disabled semantics to asChild input hosts', async ({
    render,
    root,
  }) => {
    await render('asChildDisabled');
    const input = root.locator('input');

    await expect(input).toHaveAttribute('aria-disabled', 'true');
    await expect(input).toHaveAttribute('data-disabled', 'true');
    await expect(input).toHaveAttribute('tabindex', '-1');
  });

  test('should use search as the default debounced input type', async ({
    render,
    root,
  }) => {
    await render('debouncedDefaultType');

    await expect(root.locator('input')).toHaveAttribute('type', 'search');
  });

  test('should preserve input identity and value through sibling rerenders', async ({
    render,
    root,
    run,
  }) => {
    await render('identityRerender');
    const input = root.locator('input');
    await input.focus();
    await input.fill('northwind');
    await run('flush');

    expect(await run<boolean>('sameInput')).toBe(true);
    await expect(input).toHaveValue('northwind');
    await expect(input).toBeFocused();

    // The archived test uses a programmatic click, which preserves input focus.
    await run('rerender');
    expect(await run<boolean>('sameInput')).toBe(true);
    await expect(input).toHaveValue('northwind');
    await expect(root.getByTestId('mirror')).toHaveText('northwind');
  });

  test('should forward onInput and debounce committed value', async ({
    render,
    run,
    page,
  }) => {
    await installPausedClock(page);
    await render('debouncedValues');
    await run('typeValues', ['n', 'no', 'nor']);

    expect(await run<string[]>('typedValues')).toEqual(['n', 'no', 'nor']);
    expect(await run<string[]>('committedValues')).toEqual([]);
    await page.clock.runFor(199);
    expect(await run<string[]>('committedValues')).toEqual([]);
    await page.clock.runFor(1);
    await run('flush');
    expect(await run<string[]>('committedValues')).toEqual(['nor']);
  });

  test('should emit immediate committed input when debounceMs is zero', async ({
    render,
    run,
  }) => {
    await render('debouncedImmediate');
    await run('typeValues', ['northwind']);

    expect(await run<string[]>('committedValues')).toEqual(['northwind']);
  });

  test('should cancel pending debounced input on unmount', async ({
    render,
    run,
    page,
  }) => {
    await installPausedClock(page);
    await render('debouncedUnmount');
    await run('typeValues', ['pending']);
    await run('unmount');
    await page.clock.runFor(250);

    expect(await run<string[]>('committedValues')).toEqual([]);
  });
});
