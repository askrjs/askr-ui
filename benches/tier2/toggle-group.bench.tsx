import { bench, describe } from 'vite-plus/test';
import { ToggleGroup, ToggleGroupItem } from '../../src/components';

describe('ToggleGroup benches', () => {
  bench('create toggle group', () => {
    ToggleGroup({
      defaultValue: 'one',
      children: [
        ToggleGroupItem({ value: 'one', children: 'One' }),
        ToggleGroupItem({ value: 'two', children: 'Two' }),
      ],
    });
  });
});
