import { describe, it } from 'vite-plus/test';
import { Badge } from '../../../src/components/primitives/badge';
import { expectDeterministicRender } from '../../determinism';
import { mount, unmount } from '../../test-utils';

describe('Badge - Determinism', () => {
  it('renders deterministic badge markup for default and variant hosts', () => {
    expectDeterministicRender(() => <Badge>Beta</Badge>);
    expectDeterministicRender(() => <Badge variant="warning">Warning</Badge>);
  });

  it('renders deterministic asChild badge markup', () => {
    expectDeterministicRender(() => (
      <Badge asChild variant="outline">
        <strong>Preview</strong>
      </Badge>
    ));
  });

  it('does not schedule timers during render', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
    const container = mount(<Badge>Beta</Badge>);

    try {
      expect(setTimeoutSpy).not.toHaveBeenCalled();
      expect(setIntervalSpy).not.toHaveBeenCalled();
    } finally {
      setTimeoutSpy.mockRestore();
      setIntervalSpy.mockRestore();
      unmount(container);
    }
  });
});
