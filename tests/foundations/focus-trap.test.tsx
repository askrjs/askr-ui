import { describe, it, expect, vi } from 'vitest';
import { FocusTrap } from '../../src/foundations/focus-trap';

describe('FocusTrap', () => {
  it('should call onDismiss when Escape is pressed', () => {
    const fn = vi.fn();
    const el = FocusTrap({ onDismiss: fn });
    document.body.appendChild(el);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(fn).toHaveBeenCalled();

    if ((el as any).__focusTrapUnmount) (el as any).__focusTrapUnmount();
    document.body.removeChild(el);
  });

  it('should call onDismiss when clicking outside', () => {
    const fn = vi.fn();
    const el = FocusTrap({ onDismiss: fn });
    document.body.appendChild(el);

    document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    expect(fn).toHaveBeenCalled();

    if ((el as any).__focusTrapUnmount) (el as any).__focusTrapUnmount();
    document.body.removeChild(el);
  });
});