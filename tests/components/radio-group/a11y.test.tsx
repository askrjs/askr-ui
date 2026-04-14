import { describe, expect, it } from 'vite-plus/test';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../src/components/primitives/radio-group/radio-group';
import { RADIO_GROUP_A11Y_CONTRACT } from '../../../src/components/primitives/radio-group/radio-group.a11y';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('RadioGroup - Accessibility', () => {
  it('has no automated axe violations for labelled native radio items', async () => {
    await expectNoAxeViolations(
      <RadioGroup aria-label="Size" defaultValue="m">
        <RadioGroupItem value="s">Small</RadioGroupItem>
        <RadioGroupItem value="m">Medium</RadioGroupItem>
      </RadioGroup>
    );
  });

  it('has no automated axe violations for labelled asChild radio items', async () => {
    await expectNoAxeViolations(
      <RadioGroup aria-label="Alignment" defaultValue="center">
        <RadioGroupItem asChild value="left">
          <span>Left</span>
        </RadioGroupItem>
        <RadioGroupItem asChild value="center">
          <span>Center</span>
        </RadioGroupItem>
      </RadioGroup>
    );
  });

  it('exposes radiogroup, orientation, and checked semantics', () => {
    const container = mount(
      <RadioGroup aria-label="Size" defaultValue="m" orientation="horizontal">
        <RadioGroupItem value="s">Small</RadioGroupItem>
        <RadioGroupItem value="m">Medium</RadioGroupItem>
      </RadioGroup>
    );

    try {
      const group = container.querySelector(
        `[role="${RADIO_GROUP_A11Y_CONTRACT.GROUP_ROLE}"]`
      );
      const items = Array.from(
        container.querySelectorAll('[data-slot="radio-group-item"]')
      );
      expect(group).toBeTruthy();
      expect(group?.getAttribute('role')).toBe(
        RADIO_GROUP_A11Y_CONTRACT.GROUP_ROLE
      );
      expect(
        group?.getAttribute(RADIO_GROUP_A11Y_CONTRACT.ORIENTATION_ATTRIBUTE)
      ).toBe('horizontal');
      expect(items[0]?.getAttribute('role')).toBe(
        RADIO_GROUP_A11Y_CONTRACT.ITEM_ROLE
      );
      expect(
        items[0]?.getAttribute(RADIO_GROUP_A11Y_CONTRACT.CHECKED_ATTRIBUTE)
      ).toBe('false');
      expect(
        items[1]?.getAttribute(RADIO_GROUP_A11Y_CONTRACT.CHECKED_ATTRIBUTE)
      ).toBe('true');
    } finally {
      unmount(container);
    }
  });

  it('omits aria-orientation when orientation is both', () => {
    const container = mount(
      <RadioGroup
        aria-label="Two dimensional"
        orientation="both"
        defaultValue="center"
      >
        <RadioGroupItem value="center">Center</RadioGroupItem>
      </RadioGroup>
    );

    try {
      const group = container.querySelector('[data-slot="radio-group"]');

      expect(
        group?.hasAttribute(RADIO_GROUP_A11Y_CONTRACT.ORIENTATION_ATTRIBUTE)
      ).toBe(false);
    } finally {
      unmount(container);
    }
  });

  it('uses disabled semantics for asChild radio items without native button support', () => {
    const container = mount(
      <RadioGroup aria-label="Alignment" defaultValue="left">
        <RadioGroupItem asChild value="left" disabled>
          <span>Left</span>
        </RadioGroupItem>
      </RadioGroup>
    );

    try {
      const host = container.querySelector('[data-slot="radio-group-item"]');

      expect(host?.getAttribute('aria-disabled')).toBe('true');
      expect(host?.getAttribute('tabindex')).toBe('-1');
    } finally {
      unmount(container);
    }
  });

  it('matches the documented radio group accessibility contract', () => {
    expect(RADIO_GROUP_A11Y_CONTRACT).toEqual({
      GROUP_ROLE: 'radiogroup',
      ITEM_ROLE: 'radio',
      CHECKED_ATTRIBUTE: 'aria-checked',
      ORIENTATION_ATTRIBUTE: 'aria-orientation',
      DATA_ATTRIBUTES: {
        slot: 'data-slot',
        state: 'data-state',
        disabled: 'data-disabled',
        orientation: 'data-orientation',
      },
      KEYBOARD_NAVIGATION: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'],
      ROVING_FOCUS: {
        activeItemTabIndex: 0,
        inactiveItemTabIndex: -1,
      },
      FORM_INTEGRATION: {
        hiddenInputType: 'hidden',
      },
    });
  });
});
