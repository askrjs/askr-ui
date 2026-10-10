import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { Label } from '../../src/components/label';
describe('Label benches - native', () => {
  bench(
    'SSR render native label',
    () => {
      renderToStringSync(() => (
        <Label {...{ htmlFor: 'email', children: 'Email' }} />
      ));
    },
    { throws: true }
  );
});
describe('Label benches - asChild', () => {
  bench(
    'SSR render label with asChild host',
    () => {
      renderToStringSync(() => (
        <Label
          {...{
            asChild: true,
            children: <span>Email</span>,
            'data-from-label': 'yes',
          }}
        />
      ));
    },
    { throws: true }
  );
});
