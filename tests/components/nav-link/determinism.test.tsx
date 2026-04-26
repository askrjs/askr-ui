import { describe, it } from 'vite-plus/test';
import { NavLink } from '../../../src/components/composites/nav-link';
import { expectDeterministicRender } from '../../determinism';

describe('NavLink - Determinism', () => {
  it('should render deterministic nav-link markup', () => {
    window.history.pushState({}, '', '/docs');

    expectDeterministicRender(() => (
      <nav>
        <NavLink href="/docs">Docs</NavLink>
      </nav>
    ));

    expectDeterministicRender(() => (
      <nav>
        <NavLink asChild href="/docs">
          <a href="/docs">Docs</a>
        </NavLink>
      </nav>
    ));
  });
});
