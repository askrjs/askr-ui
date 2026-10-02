import { DismissableLayer } from '../../../../../src/components/dismissable-layer';
import { mount } from '../../_mount';

export function axeInteractiveContent(root: HTMLElement): void {
  mount(
    <DismissableLayer>
      <button type="button">Layer action</button>
    </DismissableLayer>,
    root
  );
}
