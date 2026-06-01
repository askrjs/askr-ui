import { describe, it } from 'vite-plus/test';
import { Label } from '../../../../src/components/label/label';
import { expectDeterministicRender } from '../../determinism';

describe('Label - Determinism', () => {
  it('should renders deterministic native label markup', () => {
    expectDeterministicRender(() => <Label htmlFor="email">Email</Label>);
  });

  it('should renders deterministic asChild label markup', () => {
    expectDeterministicRender(() => (
      <Label asChild data-testid="email-label">
        <span>Email</span>
      </Label>
    ));
  });
});
