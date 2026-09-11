import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastHost,
  ToastTitle,
  ToastViewport,
} from '../../../../../src/components/toast';
import { mount } from '../../_mount';

export function axeToast(root: HTMLElement): void {
  mount(
    <ToastHost>
      <ToastViewport />
      <Toast defaultOpen={true}>
        <ToastTitle>Saved</ToastTitle>
        <ToastDescription>Changes stored</ToastDescription>
        <ToastAction>Undo</ToastAction>
      </Toast>
    </ToastHost>,
    root
  );
}
