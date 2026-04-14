import { describe, it, expect, afterEach } from 'vite-plus/test';
import { axe } from 'vitest-axe';
import { Button } from '../../../src/components/primitives/button/button';
import { createIsland } from '@askrjs/askr';
import { BUTTON_A11Y_CONTRACT } from '../../../src/components/primitives/button/button.a11y';

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

describe('Button - Accessibility', () => {
  it('has no automated axe violations for the native button path', async () => {
    await expectNoAxeViolations(<Button>Save</Button>);
  });

  it('has no automated axe violations for labelled asChild composition', async () => {
    await expectNoAxeViolations(
      <Button asChild>
        <a href="/docs" aria-label="Read documentation">
          Docs
        </a>
      </Button>
    );
  });

  it('uses native disabled semantics for the default host', () => {
    const container = mount(<Button disabled>Save</Button>);

    try {
      const button = container.querySelector(
        'button'
      ) as HTMLButtonElement | null;

      expect(button?.disabled).toBe(true);
      expect(button?.hasAttribute('disabled')).toBe(true);
    } finally {
      unmount(container);
    }
  });

  it('uses aria-disabled and removes disabled asChild hosts from tab order', () => {
    const container = mount(
      <Button asChild disabled>
        <a href="/docs">Docs</a>
      </Button>
    );

    try {
      const link = container.querySelector('a');

      expect(link?.getAttribute('aria-disabled')).toBe('true');
      expect(link?.getAttribute('tabindex')).toBe('-1');
    } finally {
      unmount(container);
    }
  });

  it('preserves accessible naming props from the host', () => {
    const container = mount(
      <div>
        <span id="button-label">Submit form</span>
        <Button aria-labelledby="button-label">Submit</Button>
      </div>
    );

    try {
      const button = container.querySelector('button');

      expect(button?.getAttribute('aria-labelledby')).toBe('button-label');
    } finally {
      unmount(container);
    }
  });

  it('matches the documented button accessibility contract', () => {
    expect(BUTTON_A11Y_CONTRACT.ROLE).toBe('button');
    expect(BUTTON_A11Y_CONTRACT.KEYBOARD_ACTIVATION).toEqual([
      'Enter',
      'Space',
    ]);
    expect(BUTTON_A11Y_CONTRACT.DISABLED_ATTRIBUTES).toEqual({
      native: 'disabled',
      asChild: 'aria-disabled',
    });
  });
});
