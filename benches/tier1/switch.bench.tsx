import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import { Switch } from '../../src/components/switch';
describe('Switch benches - native', () => {
  registerBench(
    'SSR render native switch',
    () => {
      renderToStringSync(() => <Switch {...{ children: 'Power' }} />);
    },
    { throws: true }
  );
});
describe('Switch benches - checked', () => {
  registerBench(
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
  registerBench(
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
