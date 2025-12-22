import { describe, it, expect, vi } from 'vitest';
import { dismissable } from '../../src/interactions/dismissable';

describe('dismissable', () => {
  it('calls onDismiss on Escape', () => {
    const onDismiss = vi.fn();
    const d = dismissable({ onDismiss });
    d.onKeyDown?.(new KeyboardEvent('keydown', { key: 'Escape' }) as any);
    expect(onDismiss).toHaveBeenCalled();
  });

  it('outsideListener calls onDismiss when isInside returns false', () => {
    const onDismiss = vi.fn();
    const d = dismissable({ onDismiss });
    const handler = d.outsideListener((t) => false);
    handler({ target: {} } as any);
    expect(onDismiss).toHaveBeenCalled();
  });

  it('outsideListener noops when isInside true', () => {
    const onDismiss = vi.fn();
    const d = dismissable({ onDismiss });
    const handler = d.outsideListener((t) => true);
    handler({ target: {} } as any);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});