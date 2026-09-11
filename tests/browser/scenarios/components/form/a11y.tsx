import { Form } from '../../../../../src/components/form';
import { mount } from '../../_mount';

export function axeLabelledControls(root: HTMLElement): void {
  mount(
    <Form>
      <label for="account-name">Name</label>
      <input id="account-name" />
      <button type="submit">Save</button>
    </Form>,
    root
  );
}
