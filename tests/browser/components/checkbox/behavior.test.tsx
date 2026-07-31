import { userEvent } from '@vitest/browser/context';
import { describe, it, expect, vi, afterEach } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { Checkbox } from '../../../../src/components/checkbox/checkbox';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Checkbox - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should renders a native checkbox input by default', () => {
    container = mount(<Checkbox />);
    const input = container.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement | null;

    expect(input).toBeTruthy();
    expect(input?.getAttribute('data-slot')).toBe('checkbox');
    expect(input?.getAttribute('data-state')).toBe('unchecked');
    expect(input?.getAttribute('aria-checked')).toBe('false');
  });

  it('should invokes onPress exactly once per native click', () => {
    const onPress = vi.fn();

    container = mount(<Checkbox onPress={onPress} />);
    const input = container.querySelector('input') as HTMLInputElement | null;

    input?.click();

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should emits uncontrolled state changes through onCheckedChange', async () => {
    const onCheckedChange = vi.fn();

    container = mount(
      <Checkbox defaultChecked={false} onCheckedChange={onCheckedChange} />
    );
    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(input?.checked).toBe(false);

    input?.click();
    await flushUpdates();

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(input?.checked).toBe(true);
    expect(input?.getAttribute('data-state')).toBe('checked');
  });

  it('should calls onCheckedChange in controlled mode', () => {
    const onCheckedChange = vi.fn();

    container = mount(
      <Checkbox checked={false} onCheckedChange={onCheckedChange} />
    );
    const input = container.querySelector('input') as HTMLInputElement | null;

    input?.click();

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('should blocks native interaction when disabled', () => {
    const onPress = vi.fn();

    container = mount(<Checkbox disabled onPress={onPress} />);
    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(input?.disabled).toBe(true);
    expect(input?.getAttribute('aria-disabled')).toBe('true');

    input?.click();

    expect(onPress).not.toHaveBeenCalled();
  });

  it('should applies checked and indeterminate state hooks to the native host', () => {
    container = mount(<Checkbox checked indeterminate />);
    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(input).toBeTruthy();
    expect(input?.getAttribute('aria-checked')).toBeNull();
    expect(input?.getAttribute('data-state')).toBe('indeterminate');
    expect(input?.indeterminate).toBe(true);
  });

  it('should update native indeterminate state on a retained input', async () => {
    let setIndeterminate = (_value: boolean) => undefined;
    let refNode: HTMLInputElement | null = null;
    const App = () => {
      const indeterminate = state(false);
      setIndeterminate = indeterminate.set;

      return (
        <Checkbox
          indeterminate={indeterminate()}
          ref={(node) => (refNode = node)}
        />
      );
    };

    container = mount(<App />);
    const input = container.querySelector('input') as HTMLInputElement;

    expect(refNode).toBe(input);
    expect(input.indeterminate).toBe(false);

    setIndeterminate(true);
    await flushUpdates();

    expect(container.querySelector('input')).toBe(input);
    expect(refNode).toBe(input);
    expect(input.indeterminate).toBe(true);

    setIndeterminate(false);
    await flushUpdates();

    expect(container.querySelector('input')).toBe(input);
    expect(refNode).toBe(input);
    expect(input.indeterminate).toBe(false);
  });

  it('should forwards refs to the asChild host', () => {
    let refNode: HTMLElement | null = null;

    container = mount(
      <Checkbox asChild ref={(node) => (refNode = node as HTMLElement | null)}>
        <div>Checkbox</div>
      </Checkbox>
    );
    const div = container.querySelector('div') as HTMLElement | null;

    expect(div).toBeTruthy();
    expect(refNode).toBe(div);
  });

  it('should toggles an asChild host with Enter and Space', async () => {
    const onCheckedChange = vi.fn();
    container = mount(
      <Checkbox asChild onCheckedChange={onCheckedChange}>
        <span>Remember me</span>
      </Checkbox>
    );

    let checkbox = container.querySelector(
      '[data-slot="checkbox"]'
    ) as HTMLElement;
    checkbox.focus();
    await userEvent.keyboard('{Enter}');
    await flushUpdates();

    checkbox = container.querySelector('[data-slot="checkbox"]') as HTMLElement;
    expect(checkbox.getAttribute('aria-checked')).toBe('true');

    checkbox.focus();
    await userEvent.keyboard(' ');
    await flushUpdates();

    checkbox = container.querySelector('[data-slot="checkbox"]') as HTMLElement;
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    expect(onCheckedChange.mock.calls).toEqual([[true], [false]]);
  });

  it('should honors caller cancellation for asChild keyboard presses', async () => {
    const onCheckedChange = vi.fn();
    container = mount(
      <Checkbox
        asChild
        onPress={(event) => event.preventDefault?.()}
        onCheckedChange={onCheckedChange}
      >
        <span>Remember me</span>
      </Checkbox>
    );

    const checkbox = container.querySelector(
      '[data-slot="checkbox"]'
    ) as HTMLElement;
    checkbox.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await flushUpdates();

    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
