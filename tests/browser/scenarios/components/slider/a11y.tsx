import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '../../../../../src/components/slider';
import { mount } from '../../_mount';

export function axeLabelledThumb(root: HTMLElement): void {
  mount(
    <Slider defaultValue={20}>
      <SliderTrack>
        <SliderRange />
        <SliderThumb aria-label="Volume" />
      </SliderTrack>
    </Slider>,
    root
  );
}
