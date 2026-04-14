import { describe, it, expect, afterEach } from 'vite-plus/test';
import { Checkbox } from '../../../src/components/primitives/checkbox/checkbox';
import { createIsland } from '@askrjs/askr';

describe('Checkbox - Determinism', () => {
  it('renders deterministic native checkbox markup', () => {
    expectDeterministicRender(() => <Checkbox />);
    expectDeterministicRender(() => (
      <Checkbox checked disabled name="terms" value="accepted" />
    ));
  });

  it('renders deterministic indeterminate and asChild checkbox markup', () => {
    expectDeterministicRender(() => <Checkbox checked indeterminate />);
    expectDeterministicRender(() => (
      <Checkbox asChild checked>
        <div role="checkbox">Agree</div>
      </Checkbox>
    ));
  });

  it('preserves checkbox state signaling across remounts', () => {
    let container = mount(<Checkbox checked={false} />);

    try {
      const firstInput = container.querySelector(
        'input'
      ) as HTMLInputElement | null;
      expect(firstInput?.getAttribute('aria-checked')).toBe('false');
    } finally {
      unmount(container);
    }

    container = mount(<Checkbox checked />);

    try {
      const secondInput = container.querySelector(
        'input'
      ) as HTMLInputElement | null;
      expect(secondInput?.getAttribute('aria-checked')).toBe('true');
    } finally {
      unmount(container);
    }
  });

  it('does not schedule timers during render', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const container = mount(<Checkbox checked />);

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
