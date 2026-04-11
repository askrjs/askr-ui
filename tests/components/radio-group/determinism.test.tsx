import { describe, expect, it, vi } from 'vite-plus/test';
import { RadioGroup, RadioGroupItem } from '../../../src/components/primitives/radio-group';
import { expectDeterministicRender } from '../../determinism';
import { mount, unmount } from '../../test-utils';

describe('RadioGroup - Determinism', () => {
  it('renders deterministic radio group markup for named and unnamed groups', () => {
    expectDeterministicRender(() => (
      <RadioGroup defaultValue="m" name="size">
        <RadioGroupItem value="s">Small</RadioGroupItem>
        <RadioGroupItem value="m">Medium</RadioGroupItem>
      </RadioGroup>
    ));

    expectDeterministicRender(() => (
      <RadioGroup defaultValue="left">
        <RadioGroupItem value="left">Left</RadioGroupItem>
      </RadioGroup>
    ));
  });

  it('renders deterministic asChild radio item markup', () => {
    expectDeterministicRender(() => (
      <RadioGroup defaultValue="left">
        <RadioGroupItem asChild value="left">
          <span>Left</span>
        </RadioGroupItem>
      </RadioGroup>
    ));
  });

  it('keeps checked state props-driven across remounts', () => {
    let container = mount(
      <RadioGroup defaultValue="small" name="size">
        <RadioGroupItem value="small">Small</RadioGroupItem>
        <RadioGroupItem value="medium">Medium</RadioGroupItem>
      </RadioGroup>
    );

    try {
      const items = Array.from(
        container.querySelectorAll('[data-slot="radio-group-item"]')
      );

      expect(items.map((item) => item.getAttribute('aria-checked'))).toEqual([
        'true',
        'false',
      ]);
      expect(container.querySelector('input[type="hidden"]')?.getAttribute('value')).toBe(
        'small'
      );
    } finally {
      unmount(container);
    }

    container = mount(
      <RadioGroup defaultValue="medium" name="size">
        <RadioGroupItem value="small">Small</RadioGroupItem>
        <RadioGroupItem value="medium">Medium</RadioGroupItem>
      </RadioGroup>
    );

    try {
      const items = Array.from(
        container.querySelectorAll('[data-slot="radio-group-item"]')
      );

      expect(items.map((item) => item.getAttribute('aria-checked'))).toEqual([
        'false',
        'true',
      ]);
      expect(container.querySelector('input[type="hidden"]')?.getAttribute('value')).toBe(
        'medium'
      );
    } finally {
      unmount(container);
    }
  });

  it('does not schedule timers during render', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const container = mount(
      <RadioGroup defaultValue="medium">
        <RadioGroupItem value="medium">Medium</RadioGroupItem>
      </RadioGroup>
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
