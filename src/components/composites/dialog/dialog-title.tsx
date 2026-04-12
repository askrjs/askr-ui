import {
  Slot,
  mergeProps,
} from '@askrjs/askr/foundations';
import { readDialogRootContext } from './dialog.shared';
import type {
  DialogTitleAsChildProps,
  DialogTitleProps,
} from './dialog.types';

export function DialogTitle(props: DialogTitleProps): JSX.Element;
export function DialogTitle(props: DialogTitleAsChildProps): JSX.Element;
export function DialogTitle(
  props: DialogTitleProps | DialogTitleAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readDialogRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: root.titleId,
    'data-slot': 'dialog-title',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <h2 {...finalProps}>{children}</h2>;
}
