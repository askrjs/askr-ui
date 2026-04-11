import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { Toggle } from '../../../src/components/primitives/toggle/toggle';
import { mount, unmount } from '../../test-utils';

describe('Toggle - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('renders a native toggle button by default', () => {
    container = mount(<Toggle>Mute</Toggle>);
    const button = container.querySelector('button') as HTMLButtonElement | null;

    expect(button).toBeTruthy();
    expect(button?.type).toBe('button');
    expect(button?.textContent).toBe('Mute');
    expect(button?.getAttribute('aria-pressed')).toBe('false');
    expect(button?.getAttribute('data-slot')).toBe('toggle');
    expect(button?.getAttribute('data-state')).toBe('off');
  });

  it('preserves an explicit native button type and pressed hooks', () => {
    container = mount(
      <Toggle type="submit" pressed>
        Save
      </Toggle>
    );
    const button = container.querySelector('button') as HTMLButtonElement | null;

    expect(button?.type).toBe('submit');
    expect(button?.getAttribute('aria-pressed')).toBe('true');
    expect(button?.getAttribute('data-state')).toBe('on');
  });

  it('invokes onPress exactly once per native click', () => {
    const onPress = vi.fn();

    container = mount(<Toggle onPress={onPress}>Mute</Toggle>);
    const button = container.querySelector('button') as HTMLButtonElement | null;

    button?.click();

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('blocks native interaction when disabled', () => {
    const onPress = vi.fn();

    container = mount(
      <Toggle disabled onPress={onPress}>
        Mute
      </Toggle>
    );
    const button = container.querySelector('button') as HTMLButtonElement | null;

    expect(button?.disabled).toBe(true);
    expect(button?.getAttribute('aria-disabled')).toBe('true');

    button?.click();

    expect(onPress).not.toHaveBeenCalled();
  });

  it('supports asChild composition and merges host props', () => {
    container = mount(
      <Toggle asChild pressed data-testid="custom-toggle" data-from-toggle="yes">
        <span data-from-child="yes">Mute</span>
      </Toggle>
    );
    const host = container.querySelector('[role="button"]');

    expect(host?.textContent).toBe('Mute');
    expect(host?.getAttribute('data-testid')).toBe('custom-toggle');
    expect(host?.getAttribute('data-from-toggle')).toBe('yes');
    expect(host?.getAttribute('data-from-child')).toBe('yes');
    expect(host?.getAttribute('aria-pressed')).toBe('true');
    expect(host?.getAttribute('data-state')).toBe('on');
    expect(host?.getAttribute('data-slot')).toBe('toggle');
  });

  it('routes interaction through the asChild host element', () => {
    const onPress = vi.fn();

    container = mount(
      <Toggle asChild onPress={onPress}>
        <span>Mute</span>
      </Toggle>
    );
    const host = container.querySelector('[role="button"]') as HTMLElement | null;

    host?.click();

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('applies disabled semantics to asChild hosts', () => {
    const onPress = vi.fn();

    container = mount(
      <Toggle asChild disabled onPress={onPress}>
        <span>Mute</span>
      </Toggle>
    );
    const host = container.querySelector('[role="button"]') as HTMLElement | null;

    expect(host?.getAttribute('aria-disabled')).toBe('true');
    expect(host?.getAttribute('tabindex')).toBe('-1');
    expect(host?.getAttribute('data-disabled')).toBe('true');

    host?.click();

    expect(onPress).not.toHaveBeenCalled();
  });

  it('forwards refs to native and asChild hosts', () => {
    let nativeRef: HTMLButtonElement | null = null;
    let childRef: HTMLElement | null = null;

    container = mount(<Toggle ref={(node) => (nativeRef = node)}>Mute</Toggle>);
    const button = container.querySelector('button') as HTMLButtonElement | null;

    expect(nativeRef).toBe(button);

    unmount(container);
    container = mount(
      <Toggle asChild ref={(node) => (childRef = node as HTMLElement | null)}>
        <span>Mute</span>
      </Toggle>
    );
    const host = container.querySelector('[role="button"]') as HTMLElement | null;

    expect(childRef).toBe(host);
  });
});
