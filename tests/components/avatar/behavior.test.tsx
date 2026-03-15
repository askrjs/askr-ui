import { describe, expect, it } from 'vitest';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../src/components/avatar';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Avatar - Behavior', () => {
  it('should keep fallback visible until image load event', async () => {
    const container = mount(
      <Avatar>
        <AvatarImage src="/avatar.png" alt="Jane Doe" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );

    try {
      expect(
        container.querySelector('[data-avatar-fallback="true"]')?.textContent
      ).toBe('JD');

      const image = container.querySelector('img');
      image?.dispatchEvent(new Event('load'));
      await flushUpdates();

      expect(container.querySelector('[data-avatar-fallback="true"]')).toBeNull();
    } finally {
      unmount(container);
    }
  });
});
