import { describe, expect, it } from 'vitest';
import { Badge } from '../../../src/components/badge';
import { mount, unmount } from '../../test-utils';

describe('Badge - Behavior', () => {
  it('should render badge headless marker', () => {
    const container = mount(<Badge>Beta</Badge>);

    try {
      expect(container.querySelector('[data-badge="true"]')?.textContent).toBe(
        'Beta'
      );
    } finally {
      unmount(container);
    }
  });
});
