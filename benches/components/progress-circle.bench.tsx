import { bench, describe } from 'vite-plus/test';
import { ProgressCircle, ProgressCircleIndicator } from '../../src/components';

describe('ProgressCircle benches', () => {
  bench('create progress circle', () => {
    ProgressCircle({
      value: 42,
      children: ProgressCircleIndicator({}),
    });
  });
});
