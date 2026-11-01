import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import { Textarea } from '../../src/components/textarea';
describe('Textarea benches', () => {
  registerBench(
    'SSR render native textarea',
    () => {
      renderToStringSync(() => (
        <Textarea {...{ rows: 4, children: 'Notes' }} />
      ));
    },
    { throws: true }
  );
  registerBench(
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
