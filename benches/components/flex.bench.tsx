import { bench, describe } from 'vite-plus/test';
import {
  Flex,
  type FlexAsChildProps,
  type FlexNativeProps,
} from '../../src/components/primitives/flex';

describe('Flex benches', () => {
  bench('create default flex', () => {
    Flex({ children: 'bench' } as unknown as FlexNativeProps);
  });

  bench('create configured flex layout', () => {
    Flex({
      direction: 'column',
      gap: '12px',
      align: 'center',
      justify: 'space-between',
      wrap: 'wrap',
      children: [<span>A</span>, <span>B</span>, <span>C</span>],
    } as unknown as FlexNativeProps);
  });

  bench('create asChild flex with prop merging', () => {
    const child = document.createElement('section');
    Flex({
      asChild: true,
      children: child,
      gap: '8px',
      'data-bench': 'flex',
    } as unknown as FlexAsChildProps);
  });
});
