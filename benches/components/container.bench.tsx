import { bench, describe } from 'vite-plus/test';
import {
  Container,
  type ContainerAsChildProps,
  type ContainerNativeProps,
} from '../../src/components/primitives/container';

describe('Container benches', () => {
  bench('create default container', () => {
    Container({ children: 'bench' } as unknown as ContainerNativeProps);
  });

  bench('create configured container layout', () => {
    Container({
      maxWidth: '72rem',
      padding: '24px',
      size: 'lg',
      children: <div>content</div>,
    } as unknown as ContainerNativeProps);
  });

  bench('create asChild container with prop merging', () => {
    const child = document.createElement('main');
    Container({
      asChild: true,
      children: child,
      padding: '16px',
      'data-bench': 'container',
    } as unknown as ContainerAsChildProps);
  });
});
