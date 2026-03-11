import { describe, it } from 'vitest';
import { DismissableLayer } from '../../../src/components/dismissable-layer';
import { FocusRing } from '../../../src/components/focus-ring';
import { FocusScope } from '../../../src/components/focus-scope';
import { expectNoAxeViolations } from '../../accessibility';

describe('Focus Foundations - Accessibility', () => {
  it('has no axe violations for FocusRing', async () => {
    await expectNoAxeViolations(
      <FocusRing>
        <button type="button">Focusable</button>
      </FocusRing>
    );
  });

  it('has no axe violations for FocusScope', async () => {
    await expectNoAxeViolations(
      <FocusScope loop>
        <button type="button">First</button>
        <button type="button">Second</button>
      </FocusScope>
    );
  });

  it('has no axe violations for DismissableLayer', async () => {
    await expectNoAxeViolations(
      <DismissableLayer>
        <button type="button">Layer action</button>
      </DismissableLayer>
    );
  });
});
