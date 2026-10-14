import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { RadioGroup, RadioGroupItem } from '../../src/components/radio-group';
describe('RadioGroup benches - default group', () => {
  bench(
    'SSR render radio group',
    () => {
      renderToStringSync(() => (
        <RadioGroup
          {...{
            name: 'size',
            defaultValue: 'medium',
            children: [
              <RadioGroupItem {...{ value: 'small', children: 'Small' }} />,
              <RadioGroupItem {...{ value: 'medium', children: 'Medium' }} />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('RadioGroup benches - asChild item', () => {
  bench(
    'SSR render radio group with asChild item',
    () => {
      renderToStringSync(() => (
        <RadioGroup
          {...{
            defaultValue: 'left',
            children: [
              <RadioGroupItem
                {...{
                  asChild: true,
                  value: 'left',
                  children: <span>Left</span>,
                }}
              />,
              <RadioGroupItem {...{ value: 'right', children: 'Right' }} />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
