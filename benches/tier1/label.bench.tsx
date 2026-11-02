import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import { Label } from '../../src/components/label';
describe('Label benches - native', () => {
  registerBench(
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
  registerBench(
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
