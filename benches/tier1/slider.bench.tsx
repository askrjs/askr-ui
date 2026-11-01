import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '../../src/components';
describe('Slider benches', () => {
  registerBench(
    'SSR render slider',
    () => {
      renderToStringSync(() => (
        <Slider
          {...{
            defaultValue: 20,
            children: [
              <SliderTrack
                {...{
                  children: [<SliderRange {...{}} />, <SliderThumb {...{}} />],
                }}
              />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
