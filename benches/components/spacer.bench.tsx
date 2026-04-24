import { bench, describe } from 'vite-plus/test';
import {
  Spacer,
  type SpacerNativeProps,
} from '../../src/components/primitives/spacer';

describe('Spacer benches', () => {
  bench('create default flex spacer', () => {
    Spacer({} as unknown as SpacerNativeProps);
  });

  bench('create configured flex spacer', () => {
    Spacer({
      grow: 2,
      shrink: 0,
      basis: '24px',
    } as unknown as SpacerNativeProps);
  });

  bench('create block spacer', () => {
    Spacer({
      axis: 'block',
      basis: '32px',
      shrink: 0,
    } as unknown as SpacerNativeProps);
  });
});
