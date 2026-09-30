import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '../../../../../src/components/slider';
import { deterministicRender } from '../../_mount';

export function sliderMarkup() {
  return {
    renders: () => [
      deterministicRender('slider with track, range, and thumb', () => (
        <Slider defaultValue={20}>
          <SliderTrack>
            <SliderRange />
            <SliderThumb />
          </SliderTrack>
        </Slider>
      )),
    ],
  };
}
