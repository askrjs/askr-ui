import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '../../src/components';
describe('Slider benches', () => {
  bench(
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
