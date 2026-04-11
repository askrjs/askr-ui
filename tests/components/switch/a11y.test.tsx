import { describe, expect, it } from 'vite-plus/test';
import { Switch } from '../../../src/components/primitives/switch/switch';
import { SWITCH_A11Y_CONTRACT } from '../../../src/components/primitives/switch/switch.a11y';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('Switch - Accessibility', () => {
  it('has no automated axe violations for the native switch path', async () => {
    await expectNoAxeViolations(<Switch>Airplane mode</Switch>);
  });

  it('has no automated axe violations for labelled asChild composition', async () => {
    await expectNoAxeViolations(
      <Switch asChild>
        <div aria-label="Power">Power</div>
      </Switch>
    );
  });

  it('exposes switch semantics when composed with asChild', () => {
    const container = mount(
      <Switch asChild defaultChecked>
        <div>Power</div>
      </Switch>
    );

    try {
      const element = container.querySelector(
        `[role="${SWITCH_A11Y_CONTRACT.ROLE}"]`
      );
      expect(element?.getAttribute('role')).toBe(SWITCH_A11Y_CONTRACT.ROLE);
      expect(
        element?.getAttribute(SWITCH_A11Y_CONTRACT.CHECKED_ATTRIBUTE)
      ).toBe('true');
    } finally {
      unmount(container);
    }
  });

  it('uses native disabled semantics and hidden form integration when named', () => {
    const container = mount(
      <Switch disabled name="power" value="enabled">
        Power
      </Switch>
    );

    try {
      const button = container.querySelector('button');
      const input = container.querySelector('input[type="checkbox"]');

      expect(button?.getAttribute('role')).toBe(SWITCH_A11Y_CONTRACT.ROLE);
      expect(button?.getAttribute('aria-disabled')).toBe('true');
      expect(input?.getAttribute('name')).toBe('power');
      expect(input?.getAttribute('value')).toBe('enabled');
      expect(input?.getAttribute('type')).toBe(
        SWITCH_A11Y_CONTRACT.FORM_INTEGRATION.hiddenInputType
      );
    } finally {
      unmount(container);
    }
  });

  it('matches the documented switch accessibility contract', () => {
    expect(SWITCH_A11Y_CONTRACT.ROLE).toBe('switch');
    expect(SWITCH_A11Y_CONTRACT.CHECKED_ATTRIBUTE).toBe('aria-checked');
    expect(SWITCH_A11Y_CONTRACT.KEYBOARD_ACTIVATION).toEqual([
      'Enter',
      'Space',
    ]);
    expect(SWITCH_A11Y_CONTRACT.DATA_ATTRIBUTES).toEqual({
      slot: 'data-slot',
      state: 'data-state',
      disabled: 'data-disabled',
    });
    expect(SWITCH_A11Y_CONTRACT.FORM_INTEGRATION).toEqual({
      host: 'button',
      hiddenInputType: 'checkbox',
      hiddenInputValue: 'on',
    });
  });
});
