import { bench, describe } from 'vite-plus/test';
import { DebouncedInput, Input } from '../../src/components/input';

describe('Input benches', () => {
  bench('create native input', () => {
    Input({ type: 'email', placeholder: 'Email' });
  });

  bench('create input with asChild host', () => {
    Input({
      asChild: true,
      children: <input aria-label="Email" />,
      'data-from-input': 'yes',
    });
  });

  bench('create debounced input', () => {
    DebouncedInput({
      'aria-label': 'Search',
      debounceMs: 180,
      onDebouncedInput: () => {},
    });
  });
});
