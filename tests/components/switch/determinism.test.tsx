import { describe, expect, it, vi } from 'vite-plus/test';
import { Switch } from '../../../src/components/primitives/switch/switch';
import { expectDeterministicRender } from '../../determinism';
import { mount, unmount } from '../../test-utils';

describe('Switch - Determinism', () => {
  it('renders deterministic native switch markup', () => {
    expectDeterministicRender(() => (
      <Switch defaultChecked>Airplane mode</Switch>
    ));
    expectDeterministicRender(() => (
      <Switch name="power" defaultChecked value="enabled">
        Power
      </Switch>
    ));
  });

  it('renders deterministic asChild switch markup', () => {
    expectDeterministicRender(() => (
      <Switch asChild disabled>
        <div>Power</div>
      </Switch>
    ));
  });

  it('keeps checked state props-driven across remounts', () => {
    let container = mount(<Switch checked={false}>Power</Switch>);

    try {
      const firstButton = container.querySelector('button');
      expect(firstButton?.getAttribute('aria-checked')).toBe('false');
    } finally {
      unmount(container);
    }

    container = mount(<Switch checked>Power</Switch>);

    try {
      const secondButton = container.querySelector('button');
      expect(secondButton?.getAttribute('aria-checked')).toBe('true');
    } finally {
      unmount(container);
    }
  });

  it('does not schedule timers during render', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const container = mount(<Switch>Power</Switch>);

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
