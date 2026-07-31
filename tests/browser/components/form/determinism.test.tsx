import { describe, it } from 'vite-plus/test';
import { Form } from '../../../../src/components/form';
import { expectDeterministicRender } from '../../determinism';

describe('Form - Determinism', () => {
  it('should render deterministic form markup', () => {
    expectDeterministicRender(() => (
      <Form action="/save">
        <button type="submit">Save</button>
      </Form>
    ));
  });
});
