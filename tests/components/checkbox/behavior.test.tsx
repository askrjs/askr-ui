import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { Checkbox } from '../../../src/components/primitives/checkbox/checkbox';
import { mount, unmount } from '../../test-utils';

describe('Checkbox - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('renders a native checkbox input by default', () => {
    container = mount(<Checkbox />);
    const input = container.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement | null;

    expect(input).toBeTruthy();
    expect(input?.getAttribute('data-slot')).toBe('checkbox');
    expect(input?.getAttribute('data-state')).toBe('unchecked');
    expect(input?.getAttribute('aria-checked')).toBe('false');
  });

  it('invokes onPress exactly once per native click', () => {
    const onPress = vi.fn();

    container = mount(<Checkbox onPress={onPress} />);
    const input = container.querySelector('input') as HTMLInputElement | null;

    input?.click();

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('blocks native interaction when disabled', () => {
    const onPress = vi.fn();

    container = mount(<Checkbox disabled onPress={onPress} />);
    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(input?.disabled).toBe(true);
    expect(input?.getAttribute('aria-disabled')).toBe('true');

    input?.click();

    expect(onPress).not.toHaveBeenCalled();
  });

  it('applies checked and indeterminate state hooks to the native host', () => {
    container = mount(<Checkbox checked indeterminate />);
    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(input?.checked).toBe(true);
    expect(input?.getAttribute('data-state')).toBe('indeterminate');
    expect(input?.getAttribute('aria-checked')).toBeNull();
  });

  it('forwards required, name, and value to the native host', () => {
    container = mount(
      <Checkbox required name="terms" value="accepted" checked />
    );
    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(input?.required).toBe(true);
    expect(input?.name).toBe('terms');
    expect(input?.value).toBe('accepted');
  });

  it('supports asChild composition and merges host props', () => {
    container = mount(
      <Checkbox
        asChild
        checked
        data-testid="custom-checkbox"
        data-from-checkbox="yes"
      >
        <div role="checkbox" data-from-child="yes">
          Agree
        </div>
      </Checkbox>
    );
    const host = container.querySelector('[role="checkbox"]');

    expect(host?.textContent).toBe('Agree');
    expect(host?.getAttribute('data-testid')).toBe('custom-checkbox');
    expect(host?.getAttribute('data-from-checkbox')).toBe('yes');
    expect(host?.getAttribute('data-from-child')).toBe('yes');
    expect(host?.getAttribute('aria-checked')).toBe('true');
    expect(host?.getAttribute('data-state')).toBe('checked');
    expect(host?.getAttribute('data-slot')).toBe('checkbox');
  });

  it('emits mixed state for indeterminate asChild hosts', () => {
    container = mount(
      <Checkbox asChild indeterminate>
        <div role="checkbox">Select all</div>
      </Checkbox>
    );
    const host = container.querySelector('[role="checkbox"]');

    expect(host?.getAttribute('aria-checked')).toBe('mixed');
    expect(host?.getAttribute('data-state')).toBe('indeterminate');
  });

  it('supports click, Enter, and Space activation for asChild hosts', () => {
    const onPress = vi.fn();

    container = mount(
      <Checkbox asChild onPress={onPress}>
        <div role="checkbox">Agree</div>
      </Checkbox>
    );
    const host = container.querySelector(
      '[role="checkbox"]'
    ) as HTMLElement | null;

    host?.click();
    host?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    host?.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true })
    );
    host?.dispatchEvent(
      new KeyboardEvent('keyup', { key: ' ', bubbles: true })
    );

    expect(onPress).toHaveBeenCalledTimes(3);
  });

  it('applies disabled semantics to asChild hosts', () => {
    const onPress = vi.fn();

    container = mount(
      <Checkbox asChild disabled onPress={onPress}>
        <div role="checkbox">Agree</div>
      </Checkbox>
    );
    const host = container.querySelector(
      '[role="checkbox"]'
    ) as HTMLElement | null;

    expect(host?.getAttribute('aria-disabled')).toBe('true');
    expect(host?.getAttribute('tabindex')).toBe('-1');
    expect(host?.getAttribute('data-disabled')).toBe('true');

    host?.click();
    host?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    host?.dispatchEvent(
      new KeyboardEvent('keyup', { key: ' ', bubbles: true })
    );

    expect(onPress).not.toHaveBeenCalled();
  });

  it('forwards refs to native and asChild hosts', () => {
    let nativeRef: HTMLInputElement | null = null;
    let childRef: HTMLElement | null = null;

    container = mount(<Checkbox ref={(node) => (nativeRef = node)} />);
    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(nativeRef).toBe(input);

    unmount(container);
    container = mount(
      <Checkbox asChild ref={(node) => (childRef = node as HTMLElement | null)}>
        <div role="checkbox">Agree</div>
      </Checkbox>
    );
    const host = container.querySelector(
      '[role="checkbox"]'
    ) as HTMLElement | null;

    expect(childRef).toBe(host);
  });
});
