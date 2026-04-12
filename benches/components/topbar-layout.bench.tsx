import { bench, describe } from 'vite-plus/test';
import { TopbarLayout } from '../../src/components/patterns/topbar-layout';
import { mount, unmount } from '../../tests/test-utils';

function buildTopbarActions(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <button type="button">Action {index + 1}</button>
  ));
}

function buildDashboardSections(count: number) {
  return Array.from({ length: count }, (_, index) => (
    <section>
      <h2>Section {index + 1}</h2>
      <p>Dashboard content {index + 1}</p>
    </section>
  ));
}

describe('TopbarLayout benches', () => {
  bench('mount topbar shell with action cluster', () => {
    const container = mount(
      <TopbarLayout
        topbar={buildTopbarActions(6)}
        topbarHeight="4rem"
        gap="20px"
      >
        {buildDashboardSections(10)}
      </TopbarLayout>
    );

    unmount(container);
  });

  bench('mount dense topbar shell with 12 actions', () => {
    const container = mount(
      <TopbarLayout
        topbar={buildTopbarActions(12)}
        topbarHeight="4.5rem"
        gap="24px"
      >
        {buildDashboardSections(14)}
      </TopbarLayout>
    );

    unmount(container);
  });
});