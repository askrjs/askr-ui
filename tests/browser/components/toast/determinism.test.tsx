import { describe, it } from 'vite-plus/test';
import {
  Toast,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../../../src/components/toast';
import { expectDeterministicRender } from '../../determinism';

describe('Toast - Determinism', () => {
  it('should renders deterministic toast markup', () => {
    expectDeterministicRender(() => (
      <ToastHost>
        <ToastViewport />
        <Toast defaultOpen={true}>
          <ToastTitle>Saved</ToastTitle>
        </Toast>
      </ToastHost>
    ));
  });
});
