import { FocusScope } from '../../../../../src/components/focus-scope';
import { mount } from '../../_mount';

export function axeScopedFocusables(root: HTMLElement): void {
  mount(
    <FocusScope loop>
      <button type="button">First</button>
      <button type="button">Second</button>
    </FocusScope>,
    root
  );
}
