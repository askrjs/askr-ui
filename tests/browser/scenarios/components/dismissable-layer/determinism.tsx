import { DismissableLayer } from '../../../../../src/components/dismissable-layer';
import { deterministicRender } from '../../_mount';

export function dismissableLayerMarkup() {
  return {
    renders: () => [
      deterministicRender('dismissable layer', () => (
        <DismissableLayer>
          <div>Layer</div>
        </DismissableLayer>
      )),
    ],
  };
}
