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

  it('should render a native checkbox input by default', () => {
    container = mount(<Checkbox />);
    const input = container.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement | null;

    expect(input).toBeTruthy();
    expect(input?.getAttribute('data-slot')).toBe('checkbox');
    expect(input?.getAttribute('data-state')).toBe('unchecked');
    expect(input?.getAttribute('aria-checked')).toBe('false');
  });

  it('should invoke onPress exactly once per native click', () => {
    const onPress = vi.fn();

    container = mount(<Checkbox onPress={onPress} />);
    const input = container.querySelector('input') as HTMLInputElement | null;

    input?.click();

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should emit uncontrolled state changes through onCheckedChange', async () => {
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

  it('should call onCheckedChange in controlled mode', () => {
    const onCheckedChange = vi.fn();

    container = mount(
      <Checkbox checked={false} onCheckedChange={onCheckedChange} />
    );
    const input = container.querySelector('input') as HTMLInputElement | null;

    input?.click();

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('should block native interaction when disabled', () => {
    const onPress = vi.fn();

    container = mount(<Checkbox disabled onPress={onPress} />);
    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(input?.disabled).toBe(true);
    expect(input?.getAttribute('aria-disabled')).toBe('true');

    input?.click();

    expect(onPress).not.toHaveBeenCalled();
  });

  it('should apply checked and indeterminate state hooks to the native host', () => {
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

  it('should forward refs to the asChild host', () => {
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

  it('should ignore Enter and toggle native and asChild hosts with Space', async () => {
    const onNativeCheckedChange = vi.fn();
    const onCheckedChange = vi.fn();
    container = mount(
      <div>
        <Checkbox
          data-testid="native-checkbox"
          onCheckedChange={onNativeCheckedChange}
        />
        <Checkbox asChild onCheckedChange={onCheckedChange}>
          <span>Remember me</span>
        </Checkbox>
      </div>
    );

    let nativeCheckbox = container.querySelector(
      '[data-testid="native-checkbox"]'
    ) as HTMLInputElement;
    nativeCheckbox.focus();
    await userEvent.keyboard('{Enter}');
    await flushUpdates();

    nativeCheckbox = container.querySelector(
      '[data-testid="native-checkbox"]'
    ) as HTMLInputElement;
    expect(nativeCheckbox.checked).toBe(false);
    expect(onNativeCheckedChange).not.toHaveBeenCalled();

    nativeCheckbox.focus();
    await userEvent.keyboard(' ');
    await flushUpdates();

    nativeCheckbox = container.querySelector(
      '[data-testid="native-checkbox"]'
    ) as HTMLInputElement;
    expect(nativeCheckbox.checked).toBe(true);
    expect(onNativeCheckedChange.mock.calls).toEqual([[true]]);

    let checkbox = container.querySelector(
      '[data-slot="checkbox"]:not(input)'
    ) as HTMLElement;
    checkbox.focus();
    await userEvent.keyboard('{Enter}');
    await flushUpdates();

    checkbox = container.querySelector(
      '[data-slot="checkbox"]:not(input)'
    ) as HTMLElement;
    expect(checkbox.getAttribute('aria-checked')).toBe('false');
    expect(onCheckedChange).not.toHaveBeenCalled();

    checkbox.focus();
    await userEvent.keyboard(' ');
    await flushUpdates();

    checkbox = container.querySelector(
      '[data-slot="checkbox"]:not(input)'
    ) as HTMLElement;
    expect(checkbox.getAttribute('aria-checked')).toBe('true');
    expect(onCheckedChange.mock.calls).toEqual([[true]]);
  });

  it('should restore uncontrolled state when its native form resets', async () => {
    const onCheckedChange = vi.fn();
    container = mount(
      <form>
        <Checkbox defaultChecked={false} onCheckedChange={onCheckedChange} />
      </form>
    );
    const form = container.querySelector('form') as HTMLFormElement;
    let input = container.querySelector('input') as HTMLInputElement;

    input.click();
    await flushUpdates();
    expect(input.checked).toBe(true);

    form.reset();
    await flushUpdates();
    input = container.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(false);
    expect(onCheckedChange.mock.calls).toEqual([[true], [false]]);
  });

  it('should honor caller cancellation for asChild keyboard presses', async () => {
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
