import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { Button } from '../../../src/components/primitives/button';
import { mount, unmount } from '../../test-utils';

describe('Button - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('renders a native button with the default button type', () => {
    container = mount(<Button>Save</Button>);

    const button = container.querySelector(
      'button'
    ) as HTMLButtonElement | null;

    expect(button).toBeTruthy();
    expect(button?.getAttribute('type')).toBe('button');
    expect(button?.getAttribute('data-slot')).toBe('button');
  });

  it('invokes onPress and merges host props for native buttons', () => {
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

  it('prevents native interaction when disabled', () => {
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

  it('supports asChild hosts with composed props and disabled semantics', () => {
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

    link?.click();

    expect(onPress).not.toHaveBeenCalled();
  });
});
