import { describe, expect, it } from 'vite-plus/test';
import { Checkbox } from '../../../src/components/primitives/checkbox/checkbox';
import { CHECKBOX_A11Y_CONTRACT } from '../../../src/components/primitives/checkbox/checkbox.a11y';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('Checkbox - Accessibility', () => {
  it('has no automated axe violations for a labelled native checkbox', async () => {
    await expectNoAxeViolations(
      <label>
        Accept terms
        <Checkbox />
      </label>
    );
  });

  it('has no automated axe violations for a labelled asChild checkbox', async () => {
    await expectNoAxeViolations(
      <Checkbox asChild>
        <div role="checkbox" aria-label="Accept terms">
          Accept terms
        </div>
      </Checkbox>
    );
  });

  it('uses implicit native checkbox semantics for the default host', () => {
    const container = mount(<Checkbox checked={false} />);

    try {
      const input = container.querySelector('input') as HTMLInputElement | null;

      expect(input?.type).toBe('checkbox');
      expect(input?.getAttribute('aria-checked')).toBe('false');
    } finally {
      unmount(container);
    }
  });

  it('uses mixed aria state for indeterminate asChild hosts', () => {
    const container = mount(
      <Checkbox asChild indeterminate>
        <div role="checkbox">Select all</div>
      </Checkbox>
    );

    try {
      const host = container.querySelector('[role="checkbox"]');

      expect(host?.getAttribute('role')).toBe(CHECKBOX_A11Y_CONTRACT.ROLE);
      expect(host?.getAttribute('aria-checked')).toBe(
        CHECKBOX_A11Y_CONTRACT.INDETERMINATE_VALUE
      );
    } finally {
      unmount(container);
    }
  });

  it('keeps native indeterminate checkboxes in the indeterminate state contract', () => {
    const container = mount(<Checkbox indeterminate />);

    try {
      const input = container.querySelector('input') as HTMLInputElement | null;

      expect(input?.getAttribute('aria-checked')).toBeNull();
      expect(input?.getAttribute('data-state')).toBe('indeterminate');
    } finally {
      unmount(container);
    }
  });

  it('uses aria-disabled and removes disabled asChild hosts from tab order', () => {
    const container = mount(
      <Checkbox asChild disabled>
        <div role="checkbox">Disabled</div>
      </Checkbox>
    );

    try {
      const host = container.querySelector('[role="checkbox"]');

      expect(host?.getAttribute('aria-disabled')).toBe('true');
      expect(host?.getAttribute('tabindex')).toBe('-1');
    } finally {
      unmount(container);
    }
  });

  it('matches the documented checkbox accessibility contract', () => {
    expect(CHECKBOX_A11Y_CONTRACT.ROLE).toBe('checkbox');
    expect(CHECKBOX_A11Y_CONTRACT.KEYBOARD_ACTIVATION).toEqual([
      'Enter',
      'Space',
    ]);
    expect(CHECKBOX_A11Y_CONTRACT.CHECKED_ATTRIBUTE).toBe('aria-checked');
    expect(CHECKBOX_A11Y_CONTRACT.INDETERMINATE_VALUE).toBe('mixed');
    expect(CHECKBOX_A11Y_CONTRACT.DISABLED_ATTRIBUTES).toEqual({
      nativeInput: {
        disabled: true,
      },
      nonNative: {
        'aria-disabled': 'true',
        tabIndex: -1,
      },
    });
    expect(CHECKBOX_A11Y_CONTRACT.DATA_ATTRIBUTES).toEqual({
      state: 'data-state',
      disabled: 'data-disabled',
    });
  });
});
