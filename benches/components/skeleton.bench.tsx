import { bench, describe } from 'vite-plus/test';
import { Skeleton } from '../../src/components';

describe('Skeleton benches', () => {
  bench('create skeleton', () => {
    Skeleton({});
  });
});
