import { describe, it } from 'vite-plus/test';
import { Separator } from '../../../src/components/primitives/separator/separator';
import { expectDeterministicRender } from '../../determinism';

describe('Separator - Determinism', () => {
  it('renders deterministic semantic separator markup', () => {
    expectDeterministicRender(() => <Separator orientation="horizontal" />);
    expectDeterministicRender(() => <Separator orientation="vertical" />);
  });

  it('renders deterministic decorative and asChild markup', () => {
    expectDeterministicRender(() => <Separator decorative />);
    expectDeterministicRender(() => (
      <Separator asChild orientation="vertical">
        <div />
      </Separator>
    ));
  });
});
