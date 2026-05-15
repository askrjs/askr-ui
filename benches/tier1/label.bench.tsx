import { bench, describe } from 'vite-plus/test';
import { Label } from '../../src/components/label';

describe('Label benches - native', () => {
  bench('create native label', () => {
    Label({ htmlFor: 'email', children: 'Email' });
  });
});

describe('Label benches - asChild', () => {
  bench('create label with asChild host', () => {
    Label({
      asChild: true,
      children: <span>Email</span>,
      'data-from-label': 'yes',
    });
  });
});
