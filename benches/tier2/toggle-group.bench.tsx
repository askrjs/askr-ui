import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { ToggleGroup, ToggleGroupItem } from '../../src/components';
describe('ToggleGroup benches', () => {
  bench(
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
