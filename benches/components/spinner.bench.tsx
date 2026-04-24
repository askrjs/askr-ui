import { bench, describe } from 'vite-plus/test';
import { Spinner } from '../../src/components';

describe('Spinner benches', () => {
  bench('create spinner', () => {
    Spinner({});
  });
});
