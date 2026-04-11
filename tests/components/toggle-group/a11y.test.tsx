import { describe, expect, it } from 'vite-plus/test';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../src/components/primitives/toggle-group';
import { TOGGLE_GROUP_A11Y_CONTRACT } from '../../../src/components/primitives/toggle-group/toggle-group.a11y';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('ToggleGroup - Accessibility', () => {
  it('has no automated axe violations for native toggle group items', async () => {
    await expectNoAxeViolations(
      <ToggleGroup defaultValue="left">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    );
  });

  it('has no automated axe violations for labelled asChild items', async () => {
    await expectNoAxeViolations(
      <ToggleGroup aria-label="Text alignment" defaultValue="left">
        <ToggleGroupItem asChild value="left">
          <span>Left</span>
        </ToggleGroupItem>
        <ToggleGroupItem asChild value="center">
          <span>Center</span>
        </ToggleGroupItem>
      </ToggleGroup>
    );
  });

  it('uses group semantics and pressed state for native items', () => {
    const container = mount(
      <ToggleGroup aria-label="Text alignment" defaultValue="left">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    );

    try {
      const group = container.querySelector('[data-slot="toggle-group"]');
      const items = Array.from(
        container.querySelectorAll('[data-slot="toggle-group-item"]')
      );

      expect(group?.getAttribute('role')).toBe(TOGGLE_GROUP_A11Y_CONTRACT.GROUP_ROLE);
      expect(group?.getAttribute('aria-label')).toBe('Text alignment');
      expect(items.map((item) => item.getAttribute('aria-pressed'))).toEqual([
        'true',
        'false',
      ]);
    } finally {
      unmount(container);
    }
  });

  it('uses button semantics for asChild items', () => {
    const container = mount(
      <ToggleGroup defaultValue="left">
        <ToggleGroupItem asChild value="left">
          <span>Left</span>
        </ToggleGroupItem>
      </ToggleGroup>
    );

    try {
      const host = container.querySelector('[data-slot="toggle-group-item"]');

      expect(host?.getAttribute('role')).toBe(TOGGLE_GROUP_A11Y_CONTRACT.ITEM_ROLE);
      expect(host?.getAttribute('aria-pressed')).toBe('true');
    } finally {
      unmount(container);
    }
  });

  it('uses disabled semantics for asChild items without native button support', () => {
    const container = mount(
      <ToggleGroup defaultValue="left">
        <ToggleGroupItem asChild value="left" disabled>
          <span>Left</span>
        </ToggleGroupItem>
      </ToggleGroup>
    );

    try {
      const host = container.querySelector('[data-slot="toggle-group-item"]');

      expect(host?.getAttribute('aria-disabled')).toBe('true');
      expect(host?.getAttribute('tabindex')).toBe('-1');
    } finally {
      unmount(container);
    }
  });

  it('matches the documented toggle group accessibility contract', () => {
    expect(TOGGLE_GROUP_A11Y_CONTRACT).toEqual({
      GROUP_ROLE: 'group',
      ITEM_ROLE: 'button',
      PRESSED_ATTRIBUTE: 'aria-pressed',
      DATA_ATTRIBUTES: {
        slot: 'data-slot',
        state: 'data-state',
        disabled: 'data-disabled',
        orientation: 'data-orientation',
      },
    });
  });
});
