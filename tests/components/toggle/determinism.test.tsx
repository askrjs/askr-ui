import { describe, it, expect, vi, afterEach } from 'vite-plus/test';
import { Toggle } from '../../../src/components/primitives/toggle/toggle';
import { createIsland } from '@askrjs/askr';

describe('Toggle - Determinism', () => {
  it('renders deterministic native toggle markup', () => {
    expectDeterministicRender(() => <Toggle>Mute</Toggle>);
    expectDeterministicRender(() => (
      <Toggle pressed type="submit">
        Save
      </Toggle>
    ));
  });

  it('renders deterministic asChild toggle markup', () => {
    expectDeterministicRender(() => (
      <Toggle asChild pressed>
        <span>Mute</span>
      </Toggle>
    ));
  });

  it('keeps pressed state props-driven across remounts', () => {
    let container = mount(<Toggle pressed={false}>Mute</Toggle>);

    try {
      const firstButton = container.querySelector('button');
      expect(firstButton?.getAttribute('aria-pressed')).toBe('false');
    } finally {
      unmount(container);
    }

    container = mount(<Toggle pressed>Mute</Toggle>);

    try {
      const secondButton = container.querySelector('button');
      expect(secondButton?.getAttribute('aria-pressed')).toBe('true');
    } finally {
      unmount(container);
    }
  });

  it('does not schedule timers during render', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const container = mount(<Toggle>Mute</Toggle>);

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
