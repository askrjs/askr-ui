import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { Switch } from '../../src/components/switch';
describe('Switch benches - native', () => {
  bench(
    'SSR render native switch',
    () => {
      renderToStringSync(() => <Switch {...{ children: 'Power' }} />);
    },
    { throws: true }
  );
});
describe('Switch benches - checked', () => {
  bench(
    'SSR render checked switch',
    () => {
      renderToStringSync(() => (
        <Switch {...{ checked: true, children: 'Power' }} />
      ));
    },
    { throws: true }
  );
});
describe('Switch benches - asChild', () => {
  bench(
    'SSR render switch with asChild host',
    () => {
      renderToStringSync(() => (
        <Switch
          {...{
            asChild: true,
            children: <div>Power</div>,
            'data-from-switch': 'yes',
          }}
        />
      ));
    },
    { throws: true }
  );
});
