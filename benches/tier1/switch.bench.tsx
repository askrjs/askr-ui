import { bench, describe } from 'vite-plus/test';
import { Switch } from '../../src/components/switch';

describe('Switch benches - native', () => {
  bench('create native switch', () => {
    Switch({ children: 'Power' });
  });
});

describe('Switch benches - checked', () => {
  bench('create checked switch', () => {
    Switch({ checked: true, children: 'Power' });
  });
});

describe('Switch benches - asChild', () => {
  bench('create switch with asChild host', () => {
    Switch({
      asChild: true,
      children: <div>Power</div>,
      'data-from-switch': 'yes',
    });
  });
});
