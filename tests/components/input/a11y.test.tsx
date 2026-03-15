import { describe, expect, it } from 'vitest';
import { Input } from '../../../src/components/input/input';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('Input - Accessibility', () => {
  it('should have no automated axe violations given labelled input', async () => {
    await expectNoAxeViolations(<Input aria-label="Email" type="email" />);
  });

  it('should expose aria-disabled when disabled', () => {
    const container = mount(<Input disabled />);

    try {
      const input = container.querySelector('input');
      expect(input?.getAttribute('aria-disabled')).toBe('true');
    } finally {
      unmount(container);
    }
  });
});
