import { describe, it } from 'vite-plus/test';
import { Textarea } from '../../../src/components/primitives/textarea/textarea';
import { expectDeterministicRender } from '../../determinism';

describe('Textarea - Determinism', () => {
  it('renders deterministic native textarea markup', () => {
    expectDeterministicRender(() => <Textarea rows={4}>Notes</Textarea>);
  });

  it('renders deterministic asChild textarea markup', () => {
    expectDeterministicRender(() => (
      <Textarea asChild>
        <textarea aria-label="Notes">Custom notes</textarea>
      </Textarea>
    ));
  });
});
