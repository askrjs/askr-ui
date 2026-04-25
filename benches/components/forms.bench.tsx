import { bench, describe } from 'vite-plus/test';
import {
  Field,
  FieldControl,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Textarea,
  VisuallyHidden,
} from '../../src/components';

describe('Form benches', () => {
  bench('create field primitives', () => {
    Field({
      id: 'email',
      children: [
        Label({ children: 'Email' }),
        FieldControl({
          fieldId: 'email',
          children: Input({ type: 'email', value: 'jane@example.com' }),
        }),
      ],
    });
    Textarea({ value: 'Notes' });
    VisuallyHidden({ children: 'Hidden label' });
  });

  bench('create radio group and switch', () => {
    RadioGroup({
      defaultValue: 'one',
      children: [
        RadioGroupItem({ value: 'one', children: 'One' }),
        RadioGroupItem({ value: 'two', children: 'Two' }),
      ],
    });
    Switch({ defaultChecked: true, children: 'Enabled' });
  });
});
