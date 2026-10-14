import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { Textarea } from '../../src/components/textarea';
describe('Textarea benches', () => {
  bench(
    'SSR render native textarea',
    () => {
      renderToStringSync(() => (
        <Textarea {...{ rows: 4, children: 'Notes' }} />
      ));
    },
    { throws: true }
  );
  bench(
    'SSR render textarea with asChild host',
    () => {
      renderToStringSync(() => (
        <Textarea
          {...{
            asChild: true,
            children: <textarea aria-label="Notes" />,
            'data-from-textarea': 'yes',
          }}
        />
      ));
    },
    { throws: true }
  );
});
