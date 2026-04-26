import { bench, describe } from 'vite-plus/test';
import { NavLink } from '../../src/components';
import { mount, unmount } from '../../tests/test-utils';

describe('NavLink benches', () => {
  bench('mount nav-link', () => {
    window.history.pushState({}, '', '/docs');
    const container = mount(<NavLink href="/docs">Docs</NavLink>);
    unmount(container);
  });
});
