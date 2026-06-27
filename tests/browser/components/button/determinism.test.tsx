import { describe, it, expect, vi } from 'vite-plus/test';
import { Button } from '../../../../src/components/button/button';
import { createIsland } from '@askrjs/askr/boot';
import { expectDeterministicRender } from '../../determinism';

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

describe('Button - Determinism', () => {
  it('should renders deterministic native button markup', () => {
    expectDeterministicRender(() => <Button>Save</Button>);
    expectDeterministicRender(() => (
      <Button variant="ghost" size="lg">
        Action
      </Button>
    ));
    expectDeterministicRender(() => (
      <Button disabled type="submit">
        Submit
      </Button>
    ));
  });

  it('should maps typed size and width affordances to stable data attributes', () => {
    const container = mount(
      <Button size="icon-xs" width="full">
        Open
      </Button>
    );

    try {
      const button = container.querySelector(
        '[data-slot="button"]'
      ) as HTMLButtonElement | null;

      expect(button?.getAttribute('data-size')).toBe('icon-xs');
      expect(button?.getAttribute('data-width')).toBe('full');
    } finally {
      unmount(container);
    }
  });

  it('should renders deterministic asChild markup', () => {
    expectDeterministicRender(() => (
      <Button asChild data-testid="docs-link">
        <a href="/docs">Docs</a>
      </Button>
    ));
  });

  it('should keeps behavior props-driven across remounts', () => {
    const firstPress = vi.fn();
    const secondPress = vi.fn();

    let container = mount(<Button onPress={firstPress}>Save</Button>);

    try {
      const firstButton = container.querySelector(
        'button'
      ) as HTMLButtonElement | null;
      firstButton?.click();
      expect(firstPress).toHaveBeenCalledTimes(1);
    } finally {
      unmount(container);
    }

    container = mount(<Button onPress={secondPress}>Save</Button>);

    try {
      const secondButton = container.querySelector(
        'button'
      ) as HTMLButtonElement | null;
      secondButton?.click();
      expect(secondPress).toHaveBeenCalledTimes(1);
    } finally {
      unmount(container);
    }
  });

  it('should does not schedule timers during render', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const container = mount(<Button>Save</Button>);

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
