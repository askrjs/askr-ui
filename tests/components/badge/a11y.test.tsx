import { describe, expect, it } from 'vite-plus/test';
import { Badge } from '../../../src/components/primitives/badge';
import { BADGE_A11Y_CONTRACT } from '../../../src/components/primitives/badge/badge.a11y';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('Badge - Accessibility', () => {
  it('has no automated axe violations for the default badge host', async () => {
    await expectNoAxeViolations(<Badge>Beta</Badge>);
  });

  it('has no automated axe violations for asChild composition', async () => {
    await expectNoAxeViolations(
      <Badge asChild>
        <strong>Preview</strong>
      </Badge>
    );
  });

  it('keeps badge semantics passive and role-free', () => {
    const container = mount(<Badge variant="info">Info</Badge>);

    try {
      const badge = container.querySelector('[data-slot="badge"]');

      expect(badge?.getAttribute(BADGE_A11Y_CONTRACT.MARKER)).toBe('true');
      expect(badge?.hasAttribute('role')).toBe(false);
      expect(badge?.textContent).toBe('Info');
    } finally {
      unmount(container);
    }
  });

  it('matches the documented badge accessibility contract', () => {
    expect(BADGE_A11Y_CONTRACT).toEqual({
      DATA_ATTRIBUTES: {
        slot: 'data-slot',
      },
      MARKER: 'data-badge',
      CONTENT: {
        textAllowed: true,
      },
    });
  });
});
