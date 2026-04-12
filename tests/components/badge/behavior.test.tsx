import { describe, expect, it } from 'vite-plus/test';
import { Badge } from '../../../src/components/primitives/badge';
import { BADGE_A11Y_CONTRACT } from '../../../src/components/primitives/badge/badge.a11y';
import { mount, unmount } from '../../test-utils';

describe('Badge - Behavior', () => {
  it('renders a passive span host with badge markers by default', () => {
    const container = mount(<Badge>Beta</Badge>);

    try {
      const badge = container.querySelector('span');

      expect(badge?.textContent).toBe('Beta');
      expect(badge?.getAttribute(BADGE_A11Y_CONTRACT.MARKER)).toBe('true');
      expect(badge?.getAttribute('data-slot')).toBe('badge');
      expect(badge?.getAttribute('data-variant')).toBeNull();
    } finally {
      unmount(container);
    }
  });

  it('exposes non-default variants through data hooks only', () => {
    const container = mount(<Badge variant="success">Stable</Badge>);

    try {
      const badge = container.querySelector('[data-slot="badge"]');

      expect(badge?.getAttribute('data-variant')).toBe('success');
      expect(badge?.textContent).toBe('Stable');
      expect(badge?.getAttribute('role')).toBeNull();
    } finally {
      unmount(container);
    }
  });

  it('supports asChild composition and merges host props', () => {
    const container = mount(
      <Badge
        asChild
        data-testid="badge"
        data-from-badge="yes"
        variant="outline"
      >
        <strong data-from-child="yes">Preview</strong>
      </Badge>
    );

    try {
      const host = container.querySelector('[data-slot="badge"]');

      expect(host?.tagName).toBe('STRONG');
      expect(host?.getAttribute('data-testid')).toBe('badge');
      expect(host?.getAttribute('data-from-badge')).toBe('yes');
      expect(host?.getAttribute('data-from-child')).toBe('yes');
      expect(host?.getAttribute('data-variant')).toBe('outline');
      expect(host?.textContent).toBe('Preview');
    } finally {
      unmount(container);
    }
  });

  it('forwards refs to native and asChild hosts', () => {
    let nativeRef: HTMLSpanElement | null = null;
    let childRef: HTMLElement | null = null;
    let container = mount(
      <Badge ref={(node) => (nativeRef = node)}>Beta</Badge>
    );

    try {
      const badge = container.querySelector('span') as HTMLSpanElement | null;

      expect(nativeRef).toBe(badge);
    } finally {
      unmount(container);
    }

    container = mount(
      <Badge asChild ref={(node) => (childRef = node as HTMLElement | null)}>
        <strong>Preview</strong>
      </Badge>
    );

    try {
      const host = container.querySelector('strong');

      expect(childRef).toBe(host);
    } finally {
      unmount(container);
    }
  });
});
