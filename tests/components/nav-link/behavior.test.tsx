import { afterEach, describe, expect, it } from 'vite-plus/test';
import { NavLink } from '../../../src/components/composites/nav-link';
import { NAV_LINK_A11Y_CONTRACT } from '../../../src/components/composites/nav-link/nav-link.a11y';
import { mount, unmount } from '../../test-utils';

describe('NavLink - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
    window.history.pushState({}, '', '/');
  });

  it('should mark the current route as active', () => {
    window.history.pushState({}, '', '/docs');

    container = mount(
      <nav>
        <NavLink href="/docs">Docs</NavLink>
        <NavLink href="/blog">Blog</NavLink>
      </nav>
    );

    const [docsLink, blogLink] = Array.from(
      container.querySelectorAll('a')
    ) as HTMLAnchorElement[];

    expect(
      docsLink.getAttribute(NAV_LINK_A11Y_CONTRACT.DATA_ATTRIBUTES.slot)
    ).toBe('nav-link');
    expect(
      docsLink.getAttribute(NAV_LINK_A11Y_CONTRACT.DATA_ATTRIBUTES.marker)
    ).toBe('true');
    expect(
      docsLink.getAttribute(NAV_LINK_A11Y_CONTRACT.DATA_ATTRIBUTES.state)
    ).toBe(NAV_LINK_A11Y_CONTRACT.ACTIVE_STATE);
    expect(
      docsLink.getAttribute(NAV_LINK_A11Y_CONTRACT.CURRENT_PAGE_ATTRIBUTE)
    ).toBe(NAV_LINK_A11Y_CONTRACT.CURRENT_PAGE_VALUE);
    expect(
      blogLink.getAttribute(NAV_LINK_A11Y_CONTRACT.DATA_ATTRIBUTES.state)
    ).toBe(NAV_LINK_A11Y_CONTRACT.INACTIVE_STATE);
    expect(
      blogLink.getAttribute(NAV_LINK_A11Y_CONTRACT.CURRENT_PAGE_ATTRIBUTE)
    ).toBeNull();
  });

  it('should update the active state when the location changes', () => {
    window.history.pushState({}, '', '/');

    container = mount(
      <nav>
        <NavLink href="/docs">Docs</NavLink>
      </nav>
    );

    const link = container.querySelector('a') as HTMLAnchorElement | null;
    expect(link?.getAttribute('data-state')).toBe('inactive');

    window.history.pushState({}, '', '/docs');

    unmount(container);
    container = mount(
      <nav>
        <NavLink href="/docs">Docs</NavLink>
      </nav>
    );

    const nextLink = container.querySelector('a') as HTMLAnchorElement | null;
    expect(nextLink?.getAttribute('data-state')).toBe('active');
    expect(nextLink?.getAttribute('aria-current')).toBe('page');
  });

  it('should support asChild composition', () => {
    window.history.pushState({}, '', '/docs');

    container = mount(
      <nav>
        <NavLink asChild href="/docs" data-from-nav="yes">
          <a data-from-child="yes">Docs</a>
        </NavLink>
      </nav>
    );

    const link = container.querySelector('a') as HTMLAnchorElement | null;

    expect(link?.getAttribute('data-from-nav')).toBe('yes');
    expect(link?.getAttribute('data-from-child')).toBe('yes');
    expect(link?.getAttribute('data-slot')).toBe('nav-link');
    expect(link?.getAttribute('data-nav-link')).toBe('true');
    expect(link?.getAttribute('data-state')).toBe('active');
    expect(link?.getAttribute('aria-current')).toBe('page');
  });
});
