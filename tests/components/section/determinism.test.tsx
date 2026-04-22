import { describe, it } from 'vite-plus/test';
import { Section } from '../../../src/components/primitives/section/section';
import { expectDeterministicRender } from '../../determinism';

describe('Section - Determinism', () => {
  it('should render deterministic section markup', () => {
    expectDeterministicRender(() => (
      <Section size={{ initial: '2', lg: '4' }}>Content</Section>
    ));
  });
});
