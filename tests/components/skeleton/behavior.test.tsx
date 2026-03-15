import { describe, expect, it } from 'vitest';
import { Skeleton } from '../../../src/components/skeleton';
import { mount, unmount } from '../../test-utils';

describe('Skeleton - Behavior', () => {
  it('should render skeleton with aria-hidden marker', () => {
    const container = mount(<Skeleton>Loading</Skeleton>);

    try {
      expect(
        container
          .querySelector('[data-skeleton="true"]')
          ?.getAttribute('aria-hidden')
      ).toBe('true');
    } finally {
      unmount(container);
    }
  });
});
