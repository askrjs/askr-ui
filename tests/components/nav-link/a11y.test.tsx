import { describe, it } from 'vite-plus/test';
import { NavLink } from '../../../src/components/composites/nav-link';
import { expectNoAxeViolations } from '../../accessibility';

describe('NavLink - Accessibility', () => {
  it('should have no automated axe violations for a navigation link', async () => {
    await expectNoAxeViolations(
      <nav>
        <NavLink href="/docs">Docs</NavLink>
      </nav>
    );
  });
});
