import { bench, describe } from 'vite-plus/test';
import {
  Section,
  type SectionAsChildProps,
  type SectionElementProps,
} from '../../src/components/primitives/section';

describe('Section benches', () => {
  bench('create default section', () => {
    Section({ children: 'bench' } as unknown as SectionElementProps);
  });

  bench('create responsive section with layout props', () => {
    Section({
      size: { initial: '2', md: '4' },
      px: { initial: '16px', lg: '32px' },
      maxWidth: '72rem',
      children: <div>section content</div>,
    } as unknown as SectionElementProps);
  });

  bench('create asChild section with merged props', () => {
    const child = document.createElement('section');
    Section({
      asChild: true,
      children: child,
      size: '1',
      py: '20px',
      'data-bench': 'section',
    } as unknown as SectionAsChildProps);
  });
});
