import { describe, expect, it } from 'vitest';
import { Spinner } from '../../../src/components/spinner';
import { mount, unmount } from '../../test-utils';

describe('Spinner - Behavior', () => {
  it('should expose aria-valuetext for label', () => {
    const container = mount(<Spinner label="Syncing" />);

    try {
      expect(container.querySelector('[role="progressbar"]')?.getAttribute('aria-valuetext')).toBe('Syncing');
    } finally {
      unmount(container);
    }
  });
});
