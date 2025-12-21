import { describe, it, expect, vi } from 'vitest';
import { Button } from '../../src/components/button';

describe('Button', () => {
  it('should render a native button given default props when rendered', () => {
    const el = Button({ children: 'Click me' } as any);
    expect(el instanceof Element).toBe(true);
    expect(el.tagName.toLowerCase()).toBe('button');
    expect(el.textContent).toBe('Click me');
  });

  it('should forward onClick and attributes given an onClick and attributes when clicked', async () => {
    const fn = vi.fn();
    const el = Button({ children: 'X', onClick: fn, 'data-test': 'ok' } as any);

    expect(el.getAttribute('data-test')).toBe('ok');

    el.dispatchEvent(new MouseEvent('click'));
    expect(fn).toHaveBeenCalled();
    expect(fn.mock.calls[0][0] instanceof MouseEvent).toBe(true);
  });

  it('should merge props onto child given asChild and child element when rendered', () => {
    const child = document.createElement('a');
    child.textContent = 'link';

    const el = Button({
      asChild: true,
      children: child,
      'aria-pressed': 'true',
    } as any) as Element;

    // When asChild, the underlying node should be the same node we passed in
    expect(el).toBe(child);
    expect(el.getAttribute('aria-pressed')).toBe('true');
  });

  it('should activate with Enter/Space given asChild and non-button child when keydown occurs', () => {
    const fn = vi.fn();
    const child = document.createElement('a');
    child.textContent = 'link';

    Button({ asChild: true, children: child, onClick: fn } as any);

    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    child.dispatchEvent(enter);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(enter.defaultPrevented).toBe(true);
    expect(fn.mock.calls[0][0] instanceof MouseEvent).toBe(true);

    const space = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    child.dispatchEvent(space);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(space.defaultPrevented).toBe(true);
  });

  it('should not forward type attribute given asChild and anchor child when type prop is provided', () => {
    const child = document.createElement('a');
    Button({ asChild: true, children: child, type: 'button' } as any);
    expect(child.getAttribute('type')).toBe(null);
  });

  it('should prevent click and key activation and set aria-disabled/tabindex given disabled and non-button child when interacted', () => {
    const fn = vi.fn();
    const child = document.createElement('a');
    Button({
      asChild: true,
      children: child,
      onClick: fn,
      disabled: true,
    } as any);

    expect(child.getAttribute('aria-disabled')).toBe('true');
    expect(child.getAttribute('tabindex')).toBe('-1');

    const click = new MouseEvent('click', { bubbles: true });
    child.dispatchEvent(click);

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    child.dispatchEvent(enter);

    expect(fn).not.toHaveBeenCalled();
  });

  it('should apply disabled to native button given disabled prop when rendered', () => {
    const fn = vi.fn();
    const el = Button({
      children: 'X',
      onClick: fn,
      disabled: true,
    } as any) as HTMLButtonElement;
    expect((el as HTMLButtonElement).disabled).toBe(true);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fn).not.toHaveBeenCalled();
  });

  it('should forward refs given asChild when ref is provided (object & function)', () => {
    const child = document.createElement('button');

    const objRef: any = { current: null };
    Button({ asChild: true, children: child, ref: objRef } as any);
    expect(objRef.current).toBe(child);

    let calledRef: any = null;
    const fnRef = (el: Element | null) => {
      calledRef = el;
    };
    Button({ asChild: true, children: child, ref: fnRef } as any);
    expect(calledRef).toBe(child);
  });

  it('should be focusable given asChild and non-button child when focused', () => {
    const child = document.createElement('a');
    Button({ asChild: true, children: child } as any);

    // Element must be in the document for focus to work in jsdom
    document.body.appendChild(child);

    // Simulate focus
    (child as HTMLElement).focus();
    expect(document.activeElement).toBe(child);

    // cleanup
    document.body.removeChild(child);
  });

  it('should call both existing onclick and provided onClick given asChild and child with existing handler when clicked', () => {
    const child = document.createElement('button');
    const existing = vi.fn();
    child.onclick = existing;

    const added = vi.fn();
    Button({ asChild: true, children: child, onClick: added } as any);

    child.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(existing).toHaveBeenCalled();
    expect(added).toHaveBeenCalled();
  });

  it('should not add role or tabIndex given asChild when child is native button', () => {
    const child = document.createElement('button');
    Button({ asChild: true, children: child } as any);

    expect(child.getAttribute('role')).toBe(null);
    expect(child.getAttribute('tabindex')).toBe(null);
  });

  it('should prevent default on Space keydown given asChild when keydown occurs', () => {
    const fn = vi.fn();
    const child = document.createElement('a');
    Button({ asChild: true, children: child, onClick: fn } as any);

    const space = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    child.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
  });

  // Accessibility: axe automated checks
  it('should have no automated axe violations given default render when evaluated by axe', async () => {
    const el = Button({ children: 'Accessible button' } as any);
    document.body.appendChild(el);

    const axe = await import('axe-core');
    const results = await axe.run(document.body);

    if (results.violations.length) {
      const msgs = results.violations
        .map((v: any) => {
          const nodes = v.nodes
            .map((n: any) => `  Target: ${n.target.join(', ')}`)
            .join('\n');
          return `axe violation: ${v.id} - ${v.description}\n${nodes}`;
        })
        .join('\n');
      throw new Error(`Accessibility violations found:\n${msgs}`);
    }

    expect(results.violations.length).toBe(0);

    // cleanup
    document.body.removeChild(el);
  });
});
