import { describe, expect, it } from 'vitest';
import { Progress, ProgressIndicator } from '../../../src/components/progress';
import { mount, unmount } from '../../test-utils';

describe('Progress - Behavior', () => {
  it('should expose progressbar metadata and indicator percentage', () => {
    const container = mount(
      <Progress value={40} max={80}>
        <ProgressIndicator />
      </Progress>
    );

    try {
      const linear = container.querySelector('[role="progressbar"]');
      expect(linear?.getAttribute('aria-valuenow')).toBe('40');
      expect(
        container
          .querySelector('[data-progress-indicator="true"]')
          ?.getAttribute('data-percentage')
      ).toBe('50');
    } finally {
      unmount(container);
    }
  });
});
