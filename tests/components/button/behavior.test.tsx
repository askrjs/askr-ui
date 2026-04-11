import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { Button } from '../../../src/components/primitives/button/button';
import { mount, unmount } from '../../test-utils';

describe('Button - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('renders a native button by default', () => {
    container = mount(<Button>Save</Button>);
    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(button).toBeTruthy();
    expect(button?.type).toBe('button');
    expect(button?.getAttribute('data-slot')).toBe('button');
    expect(button?.textContent).toBe('Save');
  });

  it('preserves an explicit native button type', () => {
    container = mount(<Button type="submit">Submit</Button>);
    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(button?.type).toBe('submit');
  });

  it('emits non-default variant and size hooks only when requested', () => {
    container = mount(
      <Button variant="ghost" size="lg">
        Action
      </Button>
    );
    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(button?.getAttribute('data-variant')).toBe('ghost');
    expect(button?.getAttribute('data-size')).toBe('lg');
  });

  it('invokes onPress exactly once per native click', () => {
    const onPress = vi.fn();

    container = mount(<Button onPress={onPress}>Save</Button>);
    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    button?.click();

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('blocks native interaction when disabled', () => {
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
    button?.click();

    expect(onPress).not.toHaveBeenCalled();
  });

  it('supports asChild composition and merges host props', () => {
    container = mount(
      <Button asChild data-from-button="yes" data-testid="docs-link">
        <a href="/docs" data-from-child="yes">
          Docs
        </a>
      </Button>
    );
    const link = container.querySelector('a') as HTMLAnchorElement | null;

    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('/docs');
    expect(link?.getAttribute('data-from-button')).toBe('yes');
    expect(link?.getAttribute('data-from-child')).toBe('yes');
    expect(link?.getAttribute('data-testid')).toBe('docs-link');
  });

  it('routes interaction through the asChild host element', () => {
    const onPress = vi.fn();

    container = mount(
      <Button asChild onPress={onPress}>
        <div role="button">Custom</div>
      </Button>
    );
    const element = container.querySelector(
      '[role="button"]'
    ) as HTMLElement | null;

    element?.click();

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies disabled semantics to asChild hosts', () => {
    const onPress = vi.fn();

    container = mount(
      <Button asChild disabled onPress={onPress}>
        <a href="/docs">Docs</a>
      </Button>
    );
    const link = container.querySelector('a') as HTMLAnchorElement | null;

    expect(link?.getAttribute('aria-disabled')).toBe('true');
    expect(link?.getAttribute('tabindex')).toBe('-1');

    link?.click();

    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not double-fire press handlers during composed native clicks', () => {
    const onPress = vi.fn();

    container = mount(
      <Button onPress={onPress} data-testid="primary-action" className="cta">
        Save
      </Button>
    );
    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(button?.getAttribute('data-testid')).toBe('primary-action');
    expect(button?.className).toBe('cta');

    button?.click();

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
