import { describe, it } from 'vite-plus/test';
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../../../src/components/toast';
import { expectNoAxeViolations } from '../../accessibility';

describe('Toast - Accessibility', () => {
  it('should has no toast accessibility regressions', async () => {
    await expectNoAxeViolations(
      <ToastHost>
        <ToastViewport />
        <Toast defaultOpen={true}>
          <ToastTitle>Saved</ToastTitle>
          <ToastDescription>Changes stored</ToastDescription>
          <ToastAction>Undo</ToastAction>
        </Toast>
      </ToastHost>
    );
  });
});
