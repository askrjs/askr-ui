import { describe, it, expect, vi } from 'vitest';
import { Slot } from '../../src/foundations/slot';

describe('Slot', () => {
  it('should merge props onto child and return same node given asChild and child element when rendered', () => {
    const child = document.createElement('div');
    child.textContent = 'child';

    const el = Slot({
      asChild: true,
      children: child,
      'data-test': 'ok',
    } as any) as Element;

    expect(el).toBe(child);
    expect(el.getAttribute('data-test')).toBe('ok');
  });

  it('should forward refs (function and object) given asChild when rendered', () => {
    const child = document.createElement('button');

    let fnRefCalled: any = null;
    const fnRef = (el: Element | null) => {
      fnRefCalled = el;
    };
    Slot({ asChild: true, children: child, ref: fnRef } as any);
    expect(fnRefCalled).toBe(child);

    const objRef: any = { current: null };
    Slot({ asChild: true, children: child, ref: objRef } as any);
    expect(objRef.current).toBe(child);
  });

  it('should merge event handlers and preserve existing onclick when asChild', () => {
    const child = document.createElement('button');
    const existing = vi.fn();
    child.onclick = existing;

    const added = vi.fn();
    Slot({ asChild: true, children: child, onClick: added } as any);

    child.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(existing).toHaveBeenCalled();
    expect(added).toHaveBeenCalled();
  });

  it('should prefer DOM properties over attributes when setting props', () => {
    const child = document.createElement('button');
    Slot({ asChild: true, children: child, disabled: true } as any);
    expect((child as HTMLButtonElement).disabled).toBe(true);
    // Attribute may be present (empty string) due to how browsers reflect boolean attributes
    expect(child.hasAttribute('disabled')).toBe(true);
  });

  it('should return a wrapper span given not asChild when rendered', () => {
    const el = Slot({ children: 'hi', 'data-test': 'wrap' } as any) as Element;
    expect(el instanceof Element).toBe(true);
    expect(el.tagName.toLowerCase()).toBe('span');
    expect(el.getAttribute('data-test')).toBe('wrap');
  });
});
