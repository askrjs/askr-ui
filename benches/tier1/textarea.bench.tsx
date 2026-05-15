import { bench, describe } from 'vite-plus/test';
import { Textarea } from '../../src/components/textarea';

describe('Textarea benches', () => {
  bench('create native textarea', () => {
    Textarea({ rows: 4, children: 'Notes' });
  });

  bench('create textarea with asChild host', () => {
    Textarea({
      asChild: true,
      children: <textarea aria-label="Notes" />,
      'data-from-textarea': 'yes',
    });
  });
});
