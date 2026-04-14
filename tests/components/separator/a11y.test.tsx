import { describe, expect, it } from 'vite-plus/test';
import { Separator } from '../../../src/components/primitives/separator/separator';
import { SEPARATOR_A11Y_CONTRACT } from '../../../src/components/primitives/separator/separator.a11y';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('Separator - Accessibility', () => {
  it('has no automated axe violations given semantic separator', async () => {
    await expectNoAxeViolations(
      <div>
        <span>Above</span>
        <Separator />
        <span>Below</span>
      </div>
    );
  });

  it('has no automated axe violations given decorative separator', async () => {
    await expectNoAxeViolations(
      <div>
        <span>Above</span>
        <Separator decorative />
        <span>Below</span>
      </div>
    );
  });

  it('should expose presentation role when decorative', () => {
    const container = mount(<Separator decorative />);

    try {
      const separator = container.querySelector('div');
      expect(separator?.getAttribute('role')).toBe(
        SEPARATOR_A11Y_CONTRACT.DECORATIVE_ROLE
      );
      expect(
        separator?.hasAttribute(SEPARATOR_A11Y_CONTRACT.ORIENTATION_ATTRIBUTE)
      ).toBe(false);
    } finally {
      unmount(container);
    }
  });

  it('matches the documented separator accessibility contract', () => {
    expect(SEPARATOR_A11Y_CONTRACT.ROLE).toBe('separator');
    expect(SEPARATOR_A11Y_CONTRACT.DECORATIVE_ROLE).toBe('presentation');
    expect(SEPARATOR_A11Y_CONTRACT.ORIENTATION_ATTRIBUTE).toBe(
      'aria-orientation'
    );
    expect(SEPARATOR_A11Y_CONTRACT.DEFAULT_ORIENTATION).toBe('horizontal');
    expect(SEPARATOR_A11Y_CONTRACT.DATA_ATTRIBUTES).toEqual({
      orientation: 'data-orientation',
    });
  });
});
