import { describe, it } from 'vitest';
import { DismissableLayer } from '../../../src/components/dismissable-layer';
import { FocusRing } from '../../../src/components/focus-ring';
import { FocusScope } from '../../../src/components/focus-scope';
import { expectDeterministicRender } from '../../determinism';

describe('Focus Foundations - Determinism', () => {
  it('renders FocusRing deterministically', () => {
    expectDeterministicRender(() => (
      <FocusRing>
        <button type="button">Focusable</button>
      </FocusRing>
    ));
  });

  it('renders FocusScope deterministically', () => {
    expectDeterministicRender(() => (
      <FocusScope trapped loop>
        <button type="button">First</button>
        <button type="button">Second</button>
      </FocusScope>
    ));
  });

  it('renders DismissableLayer deterministically', () => {
    expectDeterministicRender(() => (
      <DismissableLayer>
        <div>Layer</div>
      </DismissableLayer>
    ));
  });
});
