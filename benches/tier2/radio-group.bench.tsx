import { bench, describe } from 'vite-plus/test';
import { RadioGroup, RadioGroupItem } from '../../src/components/radio-group';

describe('RadioGroup benches - default group', () => {
  bench('create radio group', () => {
    RadioGroup({
      name: 'size',
      defaultValue: 'medium',
      children: [
        RadioGroupItem({ value: 'small', children: 'Small' }),
        RadioGroupItem({ value: 'medium', children: 'Medium' }),
      ],
    });
  });
});

describe('RadioGroup benches - asChild item', () => {
  bench('create radio group with asChild item', () => {
    RadioGroup({
      defaultValue: 'left',
      children: [
        RadioGroupItem({
          asChild: true,
          value: 'left',
          children: <span>Left</span>,
        }),
        RadioGroupItem({ value: 'right', children: 'Right' }),
      ],
    });
  });
});
