import { describe, it, expect } from 'vitest';
import { FocusScope } from '../../src/foundations/focus-scope';

describe('FocusScope', () => {
  it('should cycle focus within the scope when Tab/Shift+Tab are pressed', async () => {
    const scope = FocusScope();

    const a = document.createElement('button');
    const b = document.createElement('button');
    const c = document.createElement('button');

    scope.appendChild(a);
    scope.appendChild(b);
    scope.appendChild(c);

    document.body.appendChild(scope);

    // focus first
    a.focus();
    expect(document.activeElement).toBe(a);

    // Tab -> moves to b
    a.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await Promise.resolve();
    expect(document.activeElement).toBe(b);

    // Tab -> to c
    b.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await Promise.resolve();
    expect(document.activeElement).toBe(c);

    // Tab -> wraps to a
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    await Promise.resolve();
    expect(document.activeElement).toBe(a);

    // Shift+Tab from a -> wraps to c
    a.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    await Promise.resolve();
    expect(document.activeElement).toBe(c);

    // cleanup
    if ((scope as any).__focusScopeUnmount) (scope as any).__focusScopeUnmount();
    document.body.removeChild(scope);
  });

  it('should restore focus to previous element on unmount when restoreFocus is true', () => {
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();

    const scope = FocusScope({ restoreFocus: true });
    const a = document.createElement('button');
    scope.appendChild(a);
    document.body.appendChild(scope);

    a.focus();
    expect(document.activeElement).toBe(a);

    if ((scope as any).__focusScopeUnmount) (scope as any).__focusScopeUnmount();

    expect(document.activeElement).toBe(outside);

    document.body.removeChild(outside);
    document.body.removeChild(scope);
  });
});