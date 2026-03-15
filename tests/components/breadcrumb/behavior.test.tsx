import { describe, expect, it } from 'vitest';
import {
  Breadcrumb,
  BreadcrumbCurrent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../../../src/components/breadcrumb';
import { mount, unmount } from '../../test-utils';

describe('Breadcrumb - Behavior', () => {
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
      expect(container.querySelector('[aria-current="page"]')?.textContent).toBe(
        'Overview'
      );
      expect(container.querySelector('[data-breadcrumb-separator="true"]')).not.toBeNull();
    } finally {
      unmount(container);
    }
  });
});
