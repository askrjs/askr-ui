import { describe, expect, it } from 'vitest';
import { Switch } from '../../../src/components/switch/switch';
import { expectNoAxeViolations } from '../../accessibility';
import { mount, unmount } from '../../test-utils';

describe('Switch - Accessibility', () => {
  it('should have no automated axe violations given default switch', async () => {
    await expectNoAxeViolations(<Switch>Airplane mode</Switch>);
  });

  it('should expose switch semantics when composed with asChild', () => {
    const container = mount(
      <Switch asChild defaultChecked>
        <div>Power</div>
      </Switch>
    );

    try {
      const element = container.querySelector('[role="switch"]');
      expect(element?.getAttribute('role')).toBe('switch');
      expect(element?.getAttribute('aria-checked')).toBe('true');
    } finally {
      unmount(container);
    }
  });
});
