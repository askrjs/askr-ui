import { describe, expect, it } from 'vitest';
import {
  ProgressCircle,
  ProgressCircleIndicator,
} from '../../../src/components/progress-circle';
import { mount, unmount } from '../../test-utils';

describe('ProgressCircle - Behavior', () => {
  it('should expose circular progress metadata', () => {
    const container = mount(
      <ProgressCircle value={30} max={60}>
        <ProgressCircleIndicator />
      </ProgressCircle>
    );

    try {
      const circular = container.querySelector('[role="progressbar"]');
      expect(circular?.getAttribute('aria-valuenow')).toBe('30');
    } finally {
      unmount(container);
    }
  });
});
