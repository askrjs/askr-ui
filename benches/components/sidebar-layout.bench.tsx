import { bench, describe } from 'vite-plus/test';
import { SidebarLayout } from '../../src/components/patterns/sidebar-layout';
import { mount, unmount } from '../../tests/test-utils';

function buildSidebarLinks(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <a href={`#nav-${index + 1}`}>Section {index + 1}</a>
  ));
}

function buildMainSections(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <section>
      <h2>Panel {index + 1}</h2>
      <p>Content block {index + 1}</p>
    </section>
  ));
}

describe('SidebarLayout benches', () => {
  bench('mount sidebar shell with 12 nav items', () => {
    const container = mount(
      <SidebarLayout
        sidebar={buildSidebarLinks(12)}
        sidebarWidth="18rem"
        gap="24px"
        collapseBelow="lg"
      >
        {buildMainSections(8)}
      </SidebarLayout>
    );

    unmount(container);
  });

  bench('mount reversed sidebar shell with 24 nav items', () => {
    const container = mount(
      <SidebarLayout
        sidebar={buildSidebarLinks(24)}
        sidebarPosition="end"
        sidebarWidth="20rem"
        gap="32px"
      >
        {buildMainSections(12)}
      </SidebarLayout>
    );

    unmount(container);
  });
});