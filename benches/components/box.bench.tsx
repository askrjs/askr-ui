import { bench, describe } from 'vite-plus/test';
import {
  Box,
  type BoxAsChildProps,
  type BoxDivProps,
  type BoxSpanProps,
} from '../../src/components/primitives/box';

describe('Box benches', () => {
  bench('create default box', () => {
    Box({ children: 'bench' } as unknown as BoxDivProps);
  });

  bench('create inline box with layout props', () => {
    Box({
      as: 'span',
      display: 'inline-flex',
      px: '12px',
      py: '8px',
      gap: '6px',
      children: 'inline box',
    } as unknown as BoxSpanProps);
  });

  bench('create asChild box with merged props', () => {
    const child = document.createElement('article');
    Box({
      asChild: true,
      children: child,
      padding: '16px',
      background: 'var(--surface)',
      'data-bench': 'box',
    } as unknown as BoxAsChildProps);
  });
});
