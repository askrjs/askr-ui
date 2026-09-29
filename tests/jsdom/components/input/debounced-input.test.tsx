import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { debounceEvent } from '@askrjs/askr/fx';
import { DebouncedInput } from '../../../../src/components/input';
import { flushUpdates, mount, unmount } from '../../test-utils';

// Count debounced emitters: each one owns a timer and registers an owner
// cleanup, so a render must not create a new one.
vi.mock('@askrjs/askr/fx', async (importOriginal) => {
  const fx = await importOriginal<typeof import('@askrjs/askr/fx')>();
  return { ...fx, debounceEvent: vi.fn(fx.debounceEvent) };
});

type Props = {
  debounceMs: number;
  onDebouncedInput: ((value: string) => void) | undefined;
  version?: number;
};

/**
 * Renders DebouncedInput from parent state so a test can re-render it with new
 * props, and counts DebouncedInput renders to prove a re-render happened.
 */
function renderWithProps(initial: Props) {
  let setProps: (next: Partial<Props>) => void = () => {};
  const renders = { count: 0 };

  const Probe = (props: Props) => {
    renders.count += 1;
    return (
      <DebouncedInput
        aria-label="Search"
        debounceMs={props.debounceMs}
        onDebouncedInput={props.onDebouncedInput}
        data-version={props.version ?? 0}
      />
    );
  };

  const Parent = () => {
    const props = state<Props>(initial);
    setProps = (next) => props.set({ ...props(), ...next });
    return <Probe {...props()} />;
  };

  const container = mount(<Parent />);
  return {
    container,
    input: () => container.querySelector('input') as HTMLInputElement,
    renders,
    setProps: async (next: Partial<Props>) => {
      setProps(next);
      await flushUpdates();
    },
  };
}

function type(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('DebouncedInput - debounce state across renders', () => {
  let container: HTMLElement | undefined;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(debounceEvent).mockClear();
  });

  afterEach(() => {
    unmount(container);
    container = undefined;
    vi.useRealTimers();
  });

  it('should emit a settled value once when a controlled parent re-renders on every keystroke', async () => {
    const committed: string[] = [];
    let renders = 0;

    const Search = () => {
      const value = state('');
      renders += 1;
      return (
        <DebouncedInput
          aria-label="Search"
          value={value()}
          debounceMs={200}
          onInput={(event) => value.set(event.target.value)}
          onDebouncedInput={(next) => committed.push(next)}
        />
      );
    };

    container = mount(<Search />);
    const input = container.querySelector('input') as HTMLInputElement;

    for (const value of ['n', 'no', 'nor']) {
      type(input, value);
      await flushUpdates();
      vi.advanceTimersByTime(50);
    }
    expect(renders).toBeGreaterThan(1);

    // The last keystroke was at t=100 and it is now t=150.
    vi.advanceTimersByTime(149);
    await flushUpdates();
    expect(committed).toEqual([]);

    vi.advanceTimersByTime(1);
    await flushUpdates();
    expect(committed).toEqual(['nor']);

    vi.advanceTimersByTime(1000);
    await flushUpdates();
    expect(committed).toEqual(['nor']);
  });

  it('should keep one pending debounced call through an unrelated re-render', async () => {
    const committed: string[] = [];
    const onDebouncedInput = (value: string) => committed.push(value);
    const view = renderWithProps({ debounceMs: 200, onDebouncedInput });
    container = view.container;

    type(view.input(), 'north');
    vi.advanceTimersByTime(100);
    await view.setProps({ version: 1 });
    expect(view.renders.count).toBe(2);
    type(view.input(), 'northwind');

    vi.advanceTimersByTime(199);
    await flushUpdates();
    expect(committed).toEqual([]);

    vi.advanceTimersByTime(1);
    await flushUpdates();
    expect(committed).toEqual(['northwind']);
  });

  it('should deliver a pending value to the latest onDebouncedInput only', async () => {
    const first: string[] = [];
    const second: string[] = [];
    const view = renderWithProps({
      debounceMs: 200,
      onDebouncedInput: (value) => first.push(value),
    });
    container = view.container;

    type(view.input(), 'north');
    vi.advanceTimersByTime(100);
    await view.setProps({ onDebouncedInput: (value) => second.push(value) });

    vi.advanceTimersByTime(100);
    await flushUpdates();
    expect(first).toEqual([]);
    expect(second).toEqual(['north']);

    vi.advanceTimersByTime(1000);
    await flushUpdates();
    expect(second).toEqual(['north']);
  });

  it('should re-time a pending value with the new delay when debounceMs changes', async () => {
    const committed: string[] = [];
    const view = renderWithProps({
      debounceMs: 200,
      onDebouncedInput: (value) => committed.push(value),
    });
    container = view.container;

    type(view.input(), 'north');
    vi.advanceTimersByTime(50);
    await view.setProps({ debounceMs: 500 });

    vi.advanceTimersByTime(499);
    await flushUpdates();
    expect(committed).toEqual([]);

    vi.advanceTimersByTime(1);
    await flushUpdates();
    expect(committed).toEqual(['north']);

    type(view.input(), 'northwind');
    vi.advanceTimersByTime(499);
    await flushUpdates();
    expect(committed).toEqual(['north']);
    vi.advanceTimersByTime(1);
    await flushUpdates();
    expect(committed).toEqual(['north', 'northwind']);
  });

  it('should emit a pending value at once when debounceMs drops to zero', async () => {
    const committed: string[] = [];
    const view = renderWithProps({
      debounceMs: 200,
      onDebouncedInput: (value) => committed.push(value),
    });
    container = view.container;

    type(view.input(), 'north');
    await view.setProps({ debounceMs: 0 });
    expect(committed).toEqual(['north']);

    vi.advanceTimersByTime(1000);
    await flushUpdates();
    expect(committed).toEqual(['north']);
  });

  it('should drop a pending value when onDebouncedInput is removed', async () => {
    const committed: string[] = [];
    const view = renderWithProps({
      debounceMs: 200,
      onDebouncedInput: (value) => committed.push(value),
    });
    container = view.container;

    type(view.input(), 'north');
    await view.setProps({ onDebouncedInput: undefined });

    vi.advanceTimersByTime(1000);
    await flushUpdates();
    expect(committed).toEqual([]);
  });

  it('should cancel the pending call on unmount after re-renders', async () => {
    const committed: string[] = [];
    const onDebouncedInput = (value: string) => committed.push(value);
    const view = renderWithProps({ debounceMs: 200, onDebouncedInput });
    container = view.container;

    type(view.input(), 'north');
    await view.setProps({ version: 1 });
    await view.setProps({ debounceMs: 300 });
    type(view.input(), 'northwind');

    unmount(container);
    container = undefined;

    vi.advanceTimersByTime(1000);
    await flushUpdates();
    expect(committed).toEqual([]);
  });

  it('should create one debounced emitter per mount and one per delay change', async () => {
    const onDebouncedInput = () => {};
    const view = renderWithProps({ debounceMs: 200, onDebouncedInput });
    container = view.container;

    for (let version = 1; version <= 5; version += 1) {
      await view.setProps({ version });
    }
    expect(view.renders.count).toBe(6);
    expect(debounceEvent).toHaveBeenCalledTimes(1);

    await view.setProps({ debounceMs: 300 });
    await view.setProps({ version: 6 });
    expect(debounceEvent).toHaveBeenCalledTimes(2);
  });

  it('should cancel a pending value when the user types into a disabled input', async () => {
    const committed: string[] = [];
    let setDisabled: (value: boolean) => void = () => {};

    const Parent = () => {
      const disabled = state(false);
      setDisabled = (value) => disabled.set(value);
      return (
        <DebouncedInput
          aria-label="Search"
          disabled={disabled()}
          onDebouncedInput={(value) => committed.push(value)}
        />
      );
    };

    container = mount(<Parent />);
    const input = () => container!.querySelector('input') as HTMLInputElement;

    type(input(), 'north');
    setDisabled(true);
    await flushUpdates();
    type(input(), 'northwind');

    vi.advanceTimersByTime(1000);
    await flushUpdates();
    expect(committed).toEqual([]);
  });
});
