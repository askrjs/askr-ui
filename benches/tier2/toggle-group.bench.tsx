import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import { ToggleGroup, ToggleGroupItem } from '../../src/components';
describe('ToggleGroup benches', () => {
  registerBench(
    'SSR render toggle group',
    () => {
      renderToStringSync(() => (
        <ToggleGroup
          {...{
            defaultValue: 'one',
            children: [
              <ToggleGroupItem {...{ value: 'one', children: 'One' }} />,
              <ToggleGroupItem {...{ value: 'two', children: 'Two' }} />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
