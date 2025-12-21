import { describe, it, expect, vi } from 'vitest';
import { DismissableLayer } from '../../src/foundations/dismissable-layer';

describe('DismissableLayer', () => {
  it('should call onDismiss when Escape is pressed', () => {
    const fn = vi.fn();
    const el = DismissableLayer({ onDismiss: fn });
    document.body.appendChild(el);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fn).toHaveBeenCalled();

    if ((el as any).__dismissableUnmount) (el as any).__dismissableUnmount();
    document.body.removeChild(el);
  });

  it('should call onDismiss when clicking outside', () => {
    const fn = vi.fn();
    const el = DismissableLayer({ onDismiss: fn });
    document.body.appendChild(el);

    // Click outside
    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(fn).toHaveBeenCalled();

    if ((el as any).__dismissableUnmount) (el as any).__dismissableUnmount();
    document.body.removeChild(el);
  });

  it('should not call onDismiss when clicking inside', () => {
    const fn = vi.fn();
    const el = DismissableLayer({ onDismiss: fn });
    document.body.appendChild(el);

    const inner = document.createElement('div');
    el.appendChild(inner);
    inner.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(fn).not.toHaveBeenCalled();

    if ((el as any).__dismissableUnmount) (el as any).__dismissableUnmount();
    document.body.removeChild(el);
  });
});