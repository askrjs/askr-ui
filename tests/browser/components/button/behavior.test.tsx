import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { Link } from '@askrjs/askr/router';
import { Button } from '../../../../src/components/button';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Button - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should renders a native button with the default button type', () => {
    container = mount(<Button>Save</Button>);

    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(button).toBeTruthy();
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.getAttribute('data-slot')).toBe('button');
  });

  it('should invokes onPress and merges host props for native buttons', () => {
    const onPress = vi.fn();

    container = mount(
      <Button onPress={onPress} data-testid="primary-action" aria-label="Save">
        Save
      </Button>
    );

    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(button?.getAttribute('data-testid')).toBe('primary-action');
    expect(button?.getAttribute('aria-label')).toBe('Save');

    button?.click();

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should prevents native interaction when disabled', () => {
    const onPress = vi.fn();

    container = mount(
      <Button disabled onPress={onPress}>
        Save
      </Button>
    );

    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute('aria-disabled')).toBe('true');

    button?.click();

    expect(onPress).not.toHaveBeenCalled();
  });

  it('should supports asChild hosts with composed props and disabled semantics', () => {
    const onPress = vi.fn();

    container = mount(
      <Button asChild disabled onPress={onPress} data-from-button="yes">
        <a href="/docs" data-from-child="yes">
          Docs
        </a>
      </Button>
    );

    const link = container.querySelector('a') as HTMLAnchorElement | null;

    expect(link).toBeTruthy();
    expect(link?.getAttribute('data-from-button')).toBe('yes');
    expect(link?.getAttribute('data-from-child')).toBe('yes');
    expect(link?.getAttribute('aria-disabled')).toBe('true');
    expect(link?.getAttribute('tabindex')).toBe('-1');
    expect(link?.getAttribute('role')).toBeNull();

    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    link?.dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);

    link?.click();

    expect(onPress).not.toHaveBeenCalled();
  });

  it('should preserve native anchor semantics given an enabled asChild link', () => {
    const onPress = vi.fn();
    container = mount(
      <Button asChild onPress={onPress}>
        <a href="/docs">Docs</a>
      </Button>
    );
    const link = container.querySelector('a')!;
    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(enter);
    expect(link.getAttribute('role')).toBeNull();
    expect(link.getAttribute('tabindex')).toBeNull();
    expect(enter.defaultPrevented).toBe(false);

    link.addEventListener('click', (event) => event.preventDefault());
    link.click();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should preserve native anchor semantics given an Askr Link child', () => {
    container = mount(
      <Button asChild>
        <Link href="/docs">Docs</Link>
      </Button>
    );
    const link = container.querySelector('a')!;
    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });

    link.dispatchEvent(enter);
    expect(link.getAttribute('role')).toBeNull();
    expect(enter.defaultPrevented).toBe(false);
  });

  it('should use native semantics given a button asChild host', () => {
    const onPress = vi.fn();
    container = mount(
      <Button asChild onPress={onPress} disabled>
        <button type="button">Save</button>
      </Button>
    );
    const button = container.querySelector('button')!;

    expect((button as HTMLButtonElement).disabled).toBe(true);
    expect(button.getAttribute('role')).toBeNull();
    button.click();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should retain synthetic button semantics given a non-native asChild host', () => {
    const onPress = vi.fn();
    container = mount(
      <Button asChild onPress={onPress}>
        <span>Save</span>
      </Button>
    );
    const host = container.querySelector('span')!;

    expect(host.getAttribute('role')).toBe('button');
    expect(host.getAttribute('tabindex')).toBe('0');
    host.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should replaces stateful icon children instead of accumulating them', async () => {
    const onPress = vi.fn();

    const ThemeLikeButton = () => {
      const dark = state(false);

      return (
        <Button
          onPress={() => {
            onPress();
            dark.set(!dark());
          }}
          aria-label="Toggle icon"
        >
          {dark() ? (
            <svg aria-hidden="true" data-icon="moon" viewBox="0 0 16 16" />
          ) : (
            <svg aria-hidden="true" data-icon="sun" viewBox="0 0 16 16" />
          )}
        </Button>
      );
    };

    container = mount(<ThemeLikeButton />);

    let button = container.querySelector('button') as HTMLButtonElement | null;
    const initialButton = button;

    expect(button?.querySelectorAll('svg')).toHaveLength(1);
    expect(button?.querySelector('svg')?.getAttribute('data-icon')).toBe('sun');

    button?.click();
    await flushUpdates();

    button = container.querySelector('button') as HTMLButtonElement | null;

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(button).toBe(initialButton);
    expect(button?.querySelectorAll('svg')).toHaveLength(1);
    expect(button?.querySelector('svg')?.getAttribute('data-icon')).toBe(
      'moon'
    );

    button?.click();
    await flushUpdates();

    button = container.querySelector('button') as HTMLButtonElement | null;

    expect(onPress).toHaveBeenCalledTimes(2);
    expect(button).toBe(initialButton);
    expect(button?.querySelectorAll('svg')).toHaveLength(1);
    expect(button?.querySelector('svg')?.getAttribute('data-icon')).toBe('sun');
  });
});
