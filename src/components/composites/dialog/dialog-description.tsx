import { composeRefs, Slot, mergeProps } from '@askrjs/askr-ui/foundations';
import { readDialogRootContext } from './dialog.shared';
import type {
  DialogDescriptionAsChildProps,
  DialogDescriptionProps,
} from './dialog.types';

export function DialogDescription(props: DialogDescriptionProps): JSX.Element;
export function DialogDescription(
  props: DialogDescriptionAsChildProps
): JSX.Element;
export function DialogDescription(
  props: DialogDescriptionProps | DialogDescriptionAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readDialogRootContext();
  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        root.setDescriptionNode(node);
      }
    ),
    id: root.descriptionId,
    'data-slot': 'dialog-description',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <p {...finalProps}>{children}</p>;
}
