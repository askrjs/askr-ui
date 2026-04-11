import { describe, expect, it } from 'vite-plus/test';
import { Toggle } from '../../../src/components/primitives/toggle/toggle';
import { TOGGLE_A11Y_CONTRACT } from '../../../src/components/primitives/toggle/toggle.a11y';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('Toggle - Accessibility', () => {
  it('has no automated axe violations for the native toggle path', async () => {
    await expectNoAxeViolations(<Toggle>Mute</Toggle>);
  });

  it('has no automated axe violations for labelled asChild composition', async () => {
    await expectNoAxeViolations(
      <Toggle asChild>
        <span>Mute</span>
      </Toggle>
    );
  });

  it('uses implicit native button semantics for the default host', () => {
    const container = mount(<Toggle pressed={false}>Mute</Toggle>);

    try {
      const button = container.querySelector('button');

      expect(button?.tagName).toBe('BUTTON');
      expect(button?.getAttribute('aria-pressed')).toBe('false');
    } finally {
      unmount(container);
    }
  });

  it('uses button semantics when composed with asChild', () => {
    const container = mount(
      <Toggle asChild pressed>
        <span>Mute</span>
      </Toggle>
    );

    try {
      const host = container.querySelector('[role="button"]');

      expect(host?.getAttribute('role')).toBe(TOGGLE_A11Y_CONTRACT.ROLE);
      expect(host?.getAttribute(TOGGLE_A11Y_CONTRACT.PRESSED_ATTRIBUTE)).toBe(
        'true'
      );
    } finally {
      unmount(container);
    }
  });

  it('uses native disabled semantics for the default host', () => {
    const container = mount(<Toggle disabled>Mute</Toggle>);

    try {
      const button = container.querySelector('button');

      expect(button?.hasAttribute('disabled')).toBe(true);
      expect(button?.getAttribute('aria-disabled')).toBe('true');
    } finally {
      unmount(container);
    }
  });

  it('uses aria-disabled and removes disabled asChild hosts from tab order', () => {
    const container = mount(
      <Toggle asChild disabled>
        <span>Mute</span>
      </Toggle>
    );

    try {
      const host = container.querySelector('[role="button"]');

      expect(host?.getAttribute('aria-disabled')).toBe('true');
      expect(host?.getAttribute('tabindex')).toBe('-1');
    } finally {
      unmount(container);
    }
  });

  it('preserves accessible naming props from the host', () => {
    const container = mount(
      <div>
        <span id="toggle-label">Mute audio</span>
        <Toggle aria-labelledby="toggle-label">Mute</Toggle>
      </div>
    );

    try {
      const button = container.querySelector('button');

      expect(button?.getAttribute('aria-labelledby')).toBe('toggle-label');
    } finally {
      unmount(container);
    }
  });

  it('matches the documented toggle accessibility contract', () => {
    expect(TOGGLE_A11Y_CONTRACT.ROLE).toBe('button');
    expect(TOGGLE_A11Y_CONTRACT.KEYBOARD_ACTIVATION).toEqual([
      'Enter',
      'Space',
    ]);
    expect(TOGGLE_A11Y_CONTRACT.PRESSED_ATTRIBUTE).toBe('aria-pressed');
    expect(TOGGLE_A11Y_CONTRACT.DISABLED_ATTRIBUTES).toEqual({
      nativeButton: {
        disabled: true,
        'aria-disabled': 'true',
      },
      nonNative: {
        'aria-disabled': 'true',
        tabIndex: -1,
      },
    });
    expect(TOGGLE_A11Y_CONTRACT.DATA_ATTRIBUTES).toEqual({
      state: 'data-state',
      disabled: 'data-disabled',
    });
  });
});
