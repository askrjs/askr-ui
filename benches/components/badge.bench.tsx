import { bench, describe } from 'vite-plus/test';
import { Badge } from '../../src/components';

describe('Badge benches', () => {
  bench('create badge', () => {
    Badge({ children: 'New' });
  });
});
