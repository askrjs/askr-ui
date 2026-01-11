import { describe, it, expect, vi, afterEach } from 'vitest';
import { Toggle } from './toggle';
import { createIsland } from '@askrjs/askr';

function mount(element: JSX.Element): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  createIsland({
    root: container,
    component: () => element,
  });
  return container;
}

function unmount(container: HTMLElement) {
  if (container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

describe('Toggle — Determinism', () => {
  let container: HTMLElement;

  afterEach(() => {
    if (container) {
      unmount(container);
    }
  });

  describe('Repeatable Outcomes', () => {
    it('should render identically given same props (run 1)', () => {
      container = mount(<Toggle pressed={false}>Toggle</Toggle>);
      const button = container.querySelector('button');
      expect(button?.getAttribute('aria-pressed')).toBe('false');
      expect(button?.getAttribute('type')).toBe('button');
    });

    it('should render identically given same props (run 2)', () => {
      container = mount(<Toggle pressed={false}>Toggle</Toggle>);
      const button = container.querySelector('button');
      expect(button?.getAttribute('aria-pressed')).toBe('false');
      expect(button?.getAttribute('type')).toBe('button');
    });

    it('should render identically given same props (run 3)', () => {
      container = mount(<Toggle pressed={false}>Toggle</Toggle>);
      const button = container.querySelector('button');
      expect(button?.getAttribute('aria-pressed')).toBe('false');
      expect(button?.getAttribute('type')).toBe('button');
    });

    it('should call onPress same number of times given repeated clicks', () => {
      const onPress = vi.fn();
      container = mount(<Toggle onPress={onPress}>Toggle</Toggle>);
      const button = container.querySelector('button')!;

      button.click();
      button.click();
      button.click();

      expect(onPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('No Hidden Async', () => {
    it('should render synchronously given initial mount', () => {
      container = mount(<Toggle>Toggle</Toggle>);
      const button = container.querySelector('button');
      // Button exists immediately, no async rendering
      expect(button).toBeDefined();
    });

    it('should call onPress synchronously given click', () => {
      let callCount = 0;
      const onPress = () => {
        callCount++;
      };
      container = mount(<Toggle onPress={onPress}>Toggle</Toggle>);
      const button = container.querySelector('button')!;

      button.click();
      // onPress called synchronously, no setTimeout or Promise
      expect(callCount).toBe(1);
    });
  });

  describe('No Side Effects', () => {
    it('should NOT mutate external state given render', () => {
      const externalState = { count: 0 };
      container = mount(
        <Toggle
          onPress={() => {
            externalState.count++;
          }}
        >
          Toggle
        </Toggle>
      );
      // Render alone doesn't trigger onPress
      expect(externalState.count).toBe(0);
    });

    it('should NOT invoke onPress during render', () => {
      const onPress = vi.fn();
      container = mount(<Toggle onPress={onPress}>Toggle</Toggle>);
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Predictable State', () => {
    it('should default pressed to false given no prop', () => {
      container = mount(<Toggle>Toggle</Toggle>);
      const button = container.querySelector('button');
      expect(button?.getAttribute('aria-pressed')).toBe('false');
    });

    it('should default disabled to false given no prop', () => {
      container = mount(<Toggle>Toggle</Toggle>);
      const button = container.querySelector('button');
      expect(button?.hasAttribute('disabled')).toBe(false);
      expect(button?.hasAttribute('aria-disabled')).toBe(false);
    });

    it('should default type to button given native button', () => {
      container = mount(<Toggle>Toggle</Toggle>);
      const button = container.querySelector('button');
      expect(button?.getAttribute('type')).toBe('button');
    });
  });

  describe('Scheduler Safety', () => {
    it('should handle rapid clicks without error', () => {
      const onPress = vi.fn();
      container = mount(<Toggle onPress={onPress}>Toggle</Toggle>);
      const button = container.querySelector('button')!;

      expect(() => {
        button.click();
        button.click();
        button.click();
        button.click();
        button.click();
      }).not.toThrow();

      expect(onPress).toHaveBeenCalledTimes(5);
    });
  });
});
