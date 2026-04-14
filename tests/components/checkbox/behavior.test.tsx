import { describe, it, expect, vi, afterEach } from 'vite-plus/test';
import { Checkbox } from '../../../src/components/primitives/checkbox/checkbox';
import { flushUpdates, mount, unmount } from '../../test-utils';

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

  it('emits uncontrolled state changes through onCheckedChange', async () => {
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

  it('calls onCheckedChange in controlled mode', () => {
    const onCheckedChange = vi.fn();

    container = mount(
      <Checkbox checked={false} onCheckedChange={onCheckedChange} />
    );
    const input = container.querySelector('input') as HTMLInputElement | null;

    input?.click();

    expect(onCheckedChange).toHaveBeenCalledWith(true);
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

    expect(input).toBeTruthy();
    expect(input?.getAttribute('aria-checked')).toBeNull();
    expect(input?.getAttribute('data-state')).toBe('indeterminate');
  });

  it('forwards refs to the asChild host', () => {
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
});
