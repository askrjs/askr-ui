import { describe, it, expect, vi } from 'vitest';
import { hoverable } from '../../src/interactions/hoverable';

describe('hoverable', () => {
  it('calls onEnter/onLeave when enabled', () => {
    const onEnter = vi.fn();
    const onLeave = vi.fn();
    const h = hoverable({ onEnter, onLeave });

    h.onPointerEnter?.(new Event('pointerenter'));
    h.onPointerLeave?.(new Event('pointerleave'));

    expect(onEnter).toHaveBeenCalled();
    expect(onLeave).toHaveBeenCalled();
  });

  it('noops when disabled', () => {
    const onEnter = vi.fn();
    const h = hoverable({ onEnter, disabled: true });
    expect(h.onPointerEnter).toBeUndefined();
  });
});