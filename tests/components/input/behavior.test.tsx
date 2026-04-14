import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { createIsland } from '@askrjs/askr';
import {
  DebouncedInput,
  Input,
} from '../../../src/components/primitives/input/input';
import { flushUpdates } from '../../test-utils';

describe('Input - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    vi.useRealTimers();

    if (container) {
      unmount(container);
    }
  });

  it('renders a native input by default', () => {
    container = mount(<Input type="email" placeholder="Email" />);

    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(input?.getAttribute('type')).toBe('email');
    expect(input?.getAttribute('placeholder')).toBe('Email');
    expect(input?.getAttribute('data-slot')).toBe('input');
  });

  it('applies disabled semantics to native input', () => {
    container = mount(<Input disabled />);

    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(input?.disabled).toBe(true);
    expect(input?.getAttribute('aria-disabled')).toBe('true');
    expect(input?.getAttribute('data-disabled')).toBe('true');
  });

  it('preserves readonly semantics on native inputs', () => {
    container = mount(<Input readOnly aria-label="locked-input" />);

    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(input?.readOnly).toBe(true);
    expect(input?.hasAttribute('readonly')).toBe(true);
  });

  it('supports asChild composition and merges host props', () => {
    container = mount(
      <Input asChild data-testid="custom-input" data-from-input="yes">
        <input aria-label="Email" data-from-child="yes" />
      </Input>
    );

    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(input?.getAttribute('data-testid')).toBe('custom-input');
    expect(input?.getAttribute('data-from-input')).toBe('yes');
    expect(input?.getAttribute('data-from-child')).toBe('yes');
    expect(input?.getAttribute('data-slot')).toBe('input');
  });

  it('applies native disabled semantics to asChild input hosts', () => {
    container = mount(
      <Input asChild disabled>
        <input aria-label="Email" />
      </Input>
    );

    const host = container.querySelector('input') as HTMLInputElement | null;

    expect(host?.disabled).toBe(true);
    expect(host?.getAttribute('data-disabled')).toBe('true');
  });

  it('preserves readonly semantics on asChild input hosts', () => {
    container = mount(
      <Input asChild readOnly>
        <input aria-label="Email" />
      </Input>
    );

    const host = container.querySelector('input') as HTMLInputElement | null;

    expect(host?.readOnly).toBe(true);
    expect(host?.hasAttribute('readonly')).toBe(true);
  });

  it('fails loudly when asChild does not receive a native input host', () => {
    expect(() =>
      mount(
        <Input asChild>
          <div role="textbox">Custom input</div>
        </Input>
      )
    ).toThrow('Input `asChild` requires a native <input> host.');
  });

  it('uses search as the default debounced input type', () => {
    container = mount(<DebouncedInput aria-label="Search" />);

    const input = container.querySelector('input') as HTMLInputElement | null;

    expect(input?.type).toBe('search');
  });

  it('forwards onInput and debounces committed value', async () => {
    vi.useFakeTimers();

    const typedValues: string[] = [];
    const committedValues: string[] = [];

    container = mount(
      <DebouncedInput
        debounceMs={200}
        onInput={(event) => typedValues.push(event.target.value)}
        onDebouncedInput={(value) => committedValues.push(value)}
      />
    );

    const input = container.querySelector('input') as HTMLInputElement;

    input.value = 'n';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    input.value = 'no';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    input.value = 'nor';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(typedValues).toEqual(['n', 'no', 'nor']);
    expect(committedValues).toEqual([]);

    vi.advanceTimersByTime(199);
    expect(committedValues).toEqual([]);

    vi.advanceTimersByTime(1);
    await flushUpdates();
    expect(committedValues).toEqual(['nor']);
  });

  it('emits immediate committed input when debounceMs is zero', () => {
    const committedValues: string[] = [];

    container = mount(
      <DebouncedInput
        debounceMs={0}
        onDebouncedInput={(value) => committedValues.push(value)}
      />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    input.value = 'northwind';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(committedValues).toEqual(['northwind']);
  });

  it('cancels pending debounced input on unmount', () => {
    vi.useFakeTimers();

    const committedValues: string[] = [];

    container = mount(
      <DebouncedInput
        debounceMs={200}
        onDebouncedInput={(value) => committedValues.push(value)}
      />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    input.value = 'pending';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    unmount(container);
    container = undefined;

    vi.advanceTimersByTime(250);

    expect(committedValues).toEqual([]);
  });

  it('forwards onInput and debounces committed value', async () => {
    vi.useFakeTimers();

    const typedValues: string[] = [];
    const committedValues: string[] = [];

    container = mount(
      <DebouncedInput
        debounceMs={200}
        onInput={(event) => typedValues.push(event.target.value)}
        onDebouncedInput={(value) => committedValues.push(value)}
      />
    );

    const input = container.querySelector('input') as HTMLInputElement;

    input.value = 'n';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    input.value = 'no';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    input.value = 'nor';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(typedValues).toEqual(['n', 'no', 'nor']);
    expect(committedValues).toEqual([]);

    vi.advanceTimersByTime(199);
    expect(committedValues).toEqual([]);

    vi.advanceTimersByTime(1);
    await flushUpdates();
    expect(committedValues).toEqual(['nor']);
  });

  it('emits immediate committed input when debounceMs is zero', () => {
    const committedValues: string[] = [];

    container = mount(
      <DebouncedInput
        debounceMs={0}
        onDebouncedInput={(value) => committedValues.push(value)}
      />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    input.value = 'northwind';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    expect(committedValues).toEqual(['northwind']);
  });

  it('should cancel pending debounced input on unmount', () => {
    vi.useFakeTimers();

    const committedValues: string[] = [];

    container = mount(
      <DebouncedInput
        debounceMs={200}
        onDebouncedInput={(value) => committedValues.push(value)}
      />
    );

    const input = container.querySelector('input') as HTMLInputElement;
    input.value = 'pending';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    unmount(container);
    container = undefined as unknown as HTMLElement;

    vi.advanceTimersByTime(250);

    expect(committedValues).toEqual([]);
  });
});
