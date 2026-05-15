import { bench, describe } from 'vite-plus/test';
import { VisuallyHidden } from '../../src/components/visually-hidden';

describe('VisuallyHidden benches', () => {
  bench('create hidden span', () => {
    VisuallyHidden({ children: 'Hidden text' });
  });

  bench('create hidden asChild host', () => {
    VisuallyHidden({
      asChild: true,
      children: <strong>Hidden text</strong>,
    });
  });
});
