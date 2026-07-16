import { bench, describe } from 'vite-plus/test';
import {
  Toast,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../src/components';

describe('Toast benches', () => {
  bench('create toast stack', () => {
    ToastHost({
      children: [
        ToastViewport({}),
        Toast({
          defaultOpen: true,
          children: [ToastTitle({ children: 'Saved' })],
        }),
      ],
    });
  });
});
