import { describe, it } from 'vite-plus/test';
import { Label } from '../../../src/components/primitives/label/label';
import { expectDeterministicRender } from '../../determinism';

describe('Label - Determinism', () => {
  it('renders deterministic native label markup', () => {
    expectDeterministicRender(() => <Label htmlFor="email">Email</Label>);
  });

  it('renders deterministic asChild label markup', () => {
    expectDeterministicRender(() => (
      <Label asChild data-testid="email-label">
        <span>Email</span>
      </Label>
    ));
  });
});
