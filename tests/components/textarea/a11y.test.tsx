import { describe, expect, it } from 'vitest';
import { Textarea } from '../../../src/components/textarea/textarea';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('Textarea - Accessibility', () => {
  it('should have no automated axe violations given labelled textarea', async () => {
    await expectNoAxeViolations(<Textarea aria-label="Notes" rows={3} />);
  });

  it('should expose aria-disabled when disabled', () => {
    const container = mount(<Textarea disabled />);

    try {
      const textarea = container.querySelector('textarea');
      expect(textarea?.getAttribute('aria-disabled')).toBe('true');
    } finally {
      unmount(container);
    }
  });
});
