import { bench, describe } from 'vitest';
import { Button } from '../../src/components/button';

describe('Button benches', () => {
  bench('create native <button>', () => {
    Button({ children: 'bench' } as any);
  });

  bench('create with asChild and prop merging', () => {
    const child = document.createElement('div');
    Button({
      asChild: true,
      children: child,
      'data-test': 'ok',
      onClick: () => {},
    } as any);
  });

  bench('activation - dispatch click on native button (with handler)', () => {
    const fn = () => {};
    const el = Button({ children: 'x', onClick: fn } as any) as Element;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });

  bench('activation - dispatch click on asChild child (with handler)', () => {
    const fn = () => {};
    const child = document.createElement('div');
    const el = Button({
      asChild: true,
      children: child,
      onClick: fn,
    } as any) as Element;
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
});
