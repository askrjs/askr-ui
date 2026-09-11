import { FocusScope } from '../../../../../src/components/focus-scope';
import { deterministicRender } from '../../_mount';

export function focusScopeMarkup() {
  return {
    renders: () => [
      deterministicRender('trapped looping focus scope', () => (
        <FocusScope trapped loop>
          <button type="button">First</button>
          <button type="button">Second</button>
        </FocusScope>
      )),
    ],
  };
}
