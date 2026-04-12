import { describe, expect, it } from 'vite-plus/test';
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../../../src/components/composites/breadcrumb';
import { BREADCRUMB_A11Y_CONTRACT } from '../../../src/components/composites/breadcrumb/breadcrumb.a11y';
import { mount, unmount } from '../../test-utils';

describe('Breadcrumb - Behavior', () => {
  it('uses navigation semantics and a default breadcrumb label', () => {
    const container = mount(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbCurrent>Overview</BreadcrumbCurrent>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    try {
      const nav = container.querySelector('nav');

      expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb');
      expect(nav?.getAttribute(BREADCRUMB_A11Y_CONTRACT.DATA_ATTRIBUTES.slot)).toBe(
        'breadcrumb'
      );
    } finally {
      unmount(container);
    }
  });

  it('should mark current page and decorative separator correctly', () => {
    const container = mount(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbCurrent>Overview</BreadcrumbCurrent>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    try {
      expect(
        container.querySelector(
          `[${BREADCRUMB_A11Y_CONTRACT.CURRENT_PAGE_ATTRIBUTE}="${BREADCRUMB_A11Y_CONTRACT.CURRENT_PAGE_VALUE}"]`
        )?.textContent
      ).toBe('Overview');
      expect(
        container.querySelector(
          `[${BREADCRUMB_A11Y_CONTRACT.SEPARATOR_MARKER}="true"]`
        )
      ).not.toBeNull();
    } finally {
      unmount(container);
    }
  });

  it('supports asChild composition for root and current page parts', () => {
    const container = mount(
      <Breadcrumb asChild data-from-root="yes">
        <nav aria-label="Docs trail" data-from-host="yes">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbCurrent asChild data-from-current="yes">
                <span data-from-current-host="yes">Overview</span>
              </BreadcrumbCurrent>
            </BreadcrumbItem>
          </BreadcrumbList>
        </nav>
      </Breadcrumb>
    );

    try {
      const nav = container.querySelector('nav');
      const current = container.querySelector('[aria-current="page"]');

      expect(nav?.getAttribute('data-from-root')).toBe('yes');
      expect(nav?.getAttribute('data-from-host')).toBe('yes');
      expect(current?.textContent).toBe('Overview');
      expect(current?.getAttribute('data-from-current')).toBe('yes');
      expect(current?.getAttribute('data-from-current-host')).toBe('yes');
    } finally {
      unmount(container);
    }
  });
});
