import { describe, it, expect, vi } from 'vitest';
import { Button } from '../../src/components/button';
import type { JSXElement } from '@askrjs/askr/foundations';
import { render } from '../utils/render';

describe('Button', () => {
  it('should render a native button given default props when rendered', () => {
    const vnode = Button({ children: 'Click me' } as any);
    const el = render(vnode) as HTMLButtonElement;
    expect(el.tagName.toLowerCase()).toBe('button');
    expect(el.textContent).toBe('Click me');
  });

  it('should forward onClick and attributes given an onClick and attributes when clicked', async () => {
    const fn = vi.fn();
    const vnode = Button({ children: 'X', onClick: fn, 'data-test': 'ok' } as any);
    const el = render(vnode) as HTMLButtonElement;

    expect(el.getAttribute('data-test')).toBe('ok');

    el.dispatchEvent(new MouseEvent('click'));
    expect(fn).toHaveBeenCalled();
    expect(fn.mock.calls[0][0] instanceof MouseEvent).toBe(true);
  });

  it('should merge props onto child given asChild and child element when rendered', () => {
    const child = (<a>link</a>) as any as JSXElement;

    const vnode = Button({
      asChild: true,
      children: child,
      'aria-pressed': 'true',
    } as any);

    const el = render(vnode) as HTMLAnchorElement;
    expect(el.getAttribute('aria-pressed')).toBe('true');
    expect(el.tagName.toLowerCase()).toBe('a');
    expect(el.textContent).toBe('link');
  });

  it('should activate with Enter/Space given asChild and non-button child when keydown occurs', () => {
    const fn = vi.fn();
    const child = (<a>link</a>) as any as JSXElement;
    const vnode = Button({ asChild: true, children: child, onClick: fn } as any);
    const el = render(vnode) as HTMLAnchorElement;

    const enter = new KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(enter);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(enter.defaultPrevented).toBe(true);
    expect(fn.mock.calls[0][0] instanceof KeyboardEvent).toBe(true);

    // Space activates on keyup (matching native button semantics)
    const spaceDown = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });

    el.dispatchEvent(spaceDown);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(spaceDown.defaultPrevented).toBe(true);

    const spaceUp = new KeyboardEvent('keyup', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(spaceUp);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(spaceUp.defaultPrevented).toBe(true);
  });

  it('should not forward type attribute given asChild and anchor child when type prop is provided', () => {
    const child = (<a>link</a>) as any as JSXElement;
    const vnode = Button({ asChild: true, children: child, type: 'button' } as any);
    const el = render(vnode) as HTMLAnchorElement;
    expect(el.getAttribute('type')).toBe(null);
  });

  it('should prevent click and key activation and set aria-disabled/tabindex given disabled and non-button child when interacted', () => {
    const fn = vi.fn();
    const child = (<a>link</a>) as any as JSXElement;
    const vnode = Button({
      asChild: true,
      children: child,
      onClick: fn,
      disabled: true,
    } as any);

    const el = render(vnode) as HTMLAnchorElement;

    expect(el.getAttribute('aria-disabled')).toBe('true');
    expect(el.getAttribute('tabindex')).toBe('-1');

    const click = new MouseEvent('click', { bubbles: true });
    el.dispatchEvent(click);

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    el.dispatchEvent(enter);

    expect(fn).not.toHaveBeenCalled();
  });

  it('should apply disabled to native button given disabled prop when rendered', () => {
    const fn = vi.fn();
    const vnode = Button({
      children: 'X',
      onClick: fn,
      disabled: true,
    } as any);

    const el = render(vnode) as HTMLButtonElement;
    expect(el.disabled).toBe(true);
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fn).not.toHaveBeenCalled();
  });

  it('should forward refs given asChild when ref is provided (object & function)', () => {
    const child = (<button />) as any as JSXElement;
    const objRef: any = { current: null };
    const vnode1 = Button({ asChild: true, children: child, ref: objRef } as any);
    const el1 = render(vnode1) as HTMLButtonElement;
    expect(objRef.current).toBe(el1);

    let calledRef: any = null;
    const fnRef = (el: Element | null) => {
      calledRef = el;
    };
    render(Button({ asChild: true, children: child, ref: fnRef } as any));
    expect(calledRef).toBeInstanceOf(HTMLElement);
  });

  it('should be focusable given asChild and non-button child when focused', () => {
    const child = (<a>link</a>) as any as JSXElement;
    const vnode = Button({ asChild: true, children: child } as any);
    const el = render(vnode) as HTMLAnchorElement;

    document.body.appendChild(el);

    // Simulate focus
    (el as HTMLElement).focus();
    expect(document.activeElement).toBe(el);

    // cleanup
    document.body.removeChild(el);
  });

  it('should call both existing onclick and provided onClick given asChild and child with existing handler when clicked', () => {
    const existing = vi.fn();
    const child = (<button onClick={existing} />) as any as JSXElement;

    const added = vi.fn();
    const vnode = Button({ asChild: true, children: child, onClick: added } as any);
    const el = render(vnode) as HTMLButtonElement;

    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(existing).toHaveBeenCalled();
    expect(added).toHaveBeenCalled();
  });

  it('should not add role or tabIndex given asChild when child is native button', () => {
    const child = (<button />) as any as JSXElement;
    const vnode = Button({ asChild: true, children: child } as any);
    const el = render(vnode) as HTMLButtonElement;

    expect(el.getAttribute('role')).toBe(null);
    expect(el.getAttribute('tabindex')).toBe(null);
  });

  it('should prevent default on Space keydown given asChild when keydown occurs', () => {
    const fn = vi.fn();
    const child = (<a>link</a>) as any as JSXElement;
    const vnode = Button({ asChild: true, children: child, onClick: fn } as any);
    const el = render(vnode) as HTMLAnchorElement;

    const space = new KeyboardEvent('keydown', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
  });

  it('should activate on Space keyup given asChild and non-button child when keyup occurs', () => {
    const fn = vi.fn();
    const child = (<a>link</a>) as any as JSXElement;
    const vnode = Button({ asChild: true, children: child, onClick: fn } as any);
    const el = render(vnode) as HTMLAnchorElement;

    const spaceUp = new KeyboardEvent('keyup', {
      key: ' ',
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(spaceUp);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn.mock.calls[0][0] instanceof KeyboardEvent).toBe(true);
    expect(spaceUp.defaultPrevented).toBe(true);
  });

  // Accessibility: axe automated checks
  it('should have no automated axe violations given default render when evaluated by axe', async () => {
    const vnode = Button({ children: 'Accessible button' } as any);
    const el = render(vnode) as HTMLElement;
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
