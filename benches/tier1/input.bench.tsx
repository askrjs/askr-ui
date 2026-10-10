import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { DebouncedInput, Input } from '../../src/components/input';
describe('Input benches', () => {
  bench(
    'SSR render native input',
    () => {
      renderToStringSync(() => (
        <Input {...{ type: 'email', placeholder: 'Email' }} />
      ));
    },
    { throws: true }
  );
  bench(
    'SSR render input with asChild host',
    () => {
      renderToStringSync(() => (
        <Input
          {...{
            asChild: true,
            children: <input aria-label="Email" />,
            'data-from-input': 'yes',
          }}
        />
      ));
    },
    { throws: true }
  );
  bench(
    'SSR render debounced input',
    () => {
      renderToStringSync(() => (
        <DebouncedInput
          {...{
            'aria-label': 'Search',
            debounceMs: 180,
            onDebouncedInput: () => {},
          }}
        />
      ));
    },
    { throws: true }
  );
});
