import { describe, it } from 'vite-plus/test';
import { Input } from '../../../src/components/primitives/input/input';
import { expectDeterministicRender } from '../../determinism';
import { mount, unmount } from '../../test-utils';

describe('Input - Determinism', () => {
  it('renders deterministic native input markup', () => {
    expectDeterministicRender(() => (
      <Input type="email" placeholder="Email" disabled />
    ));
  });

  it('renders deterministic asChild and debounced input markup', () => {
    expectDeterministicRender(() => (
      <Input asChild>
        <input aria-label="Email" />
      </Input>
    ));
    expectDeterministicRender(() => (
      <DebouncedInput aria-label="Search" debounceMs={200} />
    ));
  });

  it('does not schedule timers during debounced input render', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const container = mount(
      <DebouncedInput
        aria-label="Search"
        debounceMs={200}
        onDebouncedInput={() => undefined}
      />
    );

    try {
      expect(setTimeoutSpy).not.toHaveBeenCalled();
      expect(setIntervalSpy).not.toHaveBeenCalled();
    } finally {
      setTimeoutSpy.mockRestore();
      setIntervalSpy.mockRestore();
      unmount(container);
    }
  });
});
