import { Form } from '../../../../../src/components/form';
import { deterministicRender } from '../../_mount';

export function formMarkup() {
  return {
    renders: () => [
      deterministicRender('form', () => (
        <Form action="/save">
          <button type="submit">Save</button>
        </Form>
      )),
    ],
  };
}
