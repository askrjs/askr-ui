import { bench, describe } from 'vitest';
import { Slot } from '../../src/foundations/slot';

describe('Slot benches', () => {
  bench('merge props onto child element', () => {
    const child = document.createElement('div');
    Slot({
      asChild: true,
      children: child,
      'data-test': 'x',
      onClick: () => {},
    } as any);
  });

  bench('create wrapper element', () => {
    Slot({ children: 'hi' } as any);
  });
});
