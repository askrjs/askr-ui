import {
  Button as PrimitiveButton,
  type ButtonProps as PrimitiveButtonProps,
} from '@askrjs/ui';
import { Button as ButtonSubpath } from '@askrjs/ui/button';
import {
  Dialog as CompositeDialog,
  type DialogProps as CompositeDialogProps,
} from '@askrjs/ui';
import { Dialog as DialogSubpath } from '@askrjs/ui/dialog';

const primitiveButton: typeof ButtonSubpath = PrimitiveButton;
const compositeDialog: typeof DialogSubpath = CompositeDialog;

const primitiveButtonProps: PrimitiveButtonProps = {
  children: 'Save',
};
const compositeDialogProps: CompositeDialogProps = {
  defaultOpen: true,
};

void [
  primitiveButton,
  compositeDialog,
  primitiveButtonProps,
  compositeDialogProps,
];
