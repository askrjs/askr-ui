import { describe, it, expect } from 'vitest';
import { definePortal } from '../../src/foundations/portal';

describe('definePortal', () => {
  it('should mount host element (idempotent) and expose unmount', () => {
    const P = definePortal();
    const host1 = P();
    const host2 = P();

    // mounting twice returns the same host instance
    expect(host1).toBe(host2);

    // append to DOM
    document.body.appendChild(host1);
    expect(document.body.contains(host1)).toBe(true);

    if ((host1 as any).__portalHostUnmount) (host1 as any).__portalHostUnmount();
    expect(document.body.contains(host1)).toBe(false);
  });

  it('should render children into the host when placeholder is present, and remove when placeholder removed', () => {
    const P = definePortal();
    const host = P();
    document.body.appendChild(host);

    const inner = document.createElement('span');
    inner.textContent = 'hello';

    const placeholder = P.render({ children: inner });
    // append placeholder where it's rendered in the tree
    document.body.appendChild(placeholder);

    // child should be moved into host
    expect(host.querySelector('span')?.textContent).toBe('hello');

    // remove placeholder -> should clean up content from host
    document.body.removeChild(placeholder);
    expect(host.querySelector('span')).toBe(null);

    if ((host as any).__portalHostUnmount) (host as any).__portalHostUnmount();
  });

  it('should be a no-op when rendering before host mounts', () => {
    const P = definePortal();

    const inner = document.createElement('div');
    inner.textContent = 'queued';

    const placeholder = P.render({ children: inner });
    document.body.appendChild(placeholder);

    // host not mounted yet
    const host = P();
    document.body.appendChild(host);

    // since render happened before host mounted, it should be a no-op
    expect(host.querySelector('div')).toBeNull();

    // cleanup
    document.body.removeChild(placeholder);
    if ((host as any).__portalHostUnmount) (host as any).__portalHostUnmount();
  });
});