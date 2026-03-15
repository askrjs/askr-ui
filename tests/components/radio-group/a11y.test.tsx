import { describe, expect, it } from 'vitest';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../src/components/radio-group/radio-group';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('RadioGroup - Accessibility', () => {
  it('should have no automated axe violations given labelled radio group', async () => {
    await expectNoAxeViolations(
      <RadioGroup aria-label="Size" defaultValue="m">
        <RadioGroupItem value="s">Small</RadioGroupItem>
        <RadioGroupItem value="m">Medium</RadioGroupItem>
      </RadioGroup>
    );
  });

  it('should expose radiogroup and aria-checked semantics', () => {
    const container = mount(
      <RadioGroup aria-label="Size" defaultValue="m">
        <RadioGroupItem value="s">Small</RadioGroupItem>
        <RadioGroupItem value="m">Medium</RadioGroupItem>
      </RadioGroup>
    );

    try {
      const group = container.querySelector('[role="radiogroup"]');
      const items = container.querySelectorAll('button');
      expect(group).toBeTruthy();
      expect(items[0]?.getAttribute('aria-checked')).toBe('false');
      expect(items[1]?.getAttribute('aria-checked')).toBe('true');
    } finally {
      unmount(container);
    }
  });
});
