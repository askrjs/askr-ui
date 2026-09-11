import {
  Toast,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../../../../src/components/toast';
import { deterministicRender } from '../../_mount';

export function toastMarkup() {
  return {
    renders: () => [
      deterministicRender('default open toast', () => (
        <ToastHost>
          <ToastViewport />
          <Toast defaultOpen={true}>
            <ToastTitle>Saved</ToastTitle>
          </Toast>
        </ToastHost>
      )),
    ],
  };
}
