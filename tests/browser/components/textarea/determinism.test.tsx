import { describe, it } from 'vite-plus/test';
import { Textarea } from '../../../../src/components/textarea/textarea';
import { expectDeterministicRender } from '../../determinism';

describe('Textarea - Determinism', () => {
  it('should render deterministic native textarea markup', () => {
    expectDeterministicRender(() => <Textarea rows={4}>Notes</Textarea>);
  });

  it('should render deterministic asChild textarea markup', () => {
    expectDeterministicRender(() => (
      <Textarea asChild>
        <textarea aria-label="Notes">Custom notes</textarea>
      </Textarea>
    ));
  });
});
