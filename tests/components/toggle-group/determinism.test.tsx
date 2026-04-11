import { describe, expect, it, vi } from 'vite-plus/test';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../src/components/primitives/toggle-group';
import { expectDeterministicRender } from '../../determinism';
import { mount, unmount } from '../../test-utils';

describe('ToggleGroup - Determinism', () => {
  it('renders deterministic single and multiple toggle group markup', () => {
    expectDeterministicRender(() => (
      <ToggleGroup defaultValue="left">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
      </ToggleGroup>
    ));

    expectDeterministicRender(() => (
      <ToggleGroup type="multiple" defaultValue={['left']}>
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    ));
  });

  it('renders deterministic asChild item markup', () => {
    expectDeterministicRender(() => (
      <ToggleGroup defaultValue="left">
        <ToggleGroupItem asChild value="left">
          <span>Left</span>
        </ToggleGroupItem>
      </ToggleGroup>
    ));
  });

  it('keeps selection props-driven across remounts', () => {
    let container = mount(
      <ToggleGroup defaultValue="left">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    );

    try {
      const items = Array.from(
        container.querySelectorAll('[data-slot="toggle-group-item"]')
      );

      expect(items.map((item) => item.getAttribute('aria-pressed'))).toEqual([
        'true',
        'false',
      ]);
    } finally {
      unmount(container);
    }

    container = mount(
      <ToggleGroup defaultValue="right">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    );

    try {
      const items = Array.from(
        container.querySelectorAll('[data-slot="toggle-group-item"]')
      );

      expect(items.map((item) => item.getAttribute('aria-pressed'))).toEqual([
        'false',
        'true',
      ]);
    } finally {
      unmount(container);
    }
  });

  it('does not schedule timers during render', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const container = mount(
      <ToggleGroup defaultValue="left">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
      </ToggleGroup>
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
