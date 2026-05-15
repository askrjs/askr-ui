import { composeRefs, Slot, mergeProps } from '@askrjs/askr/foundations';
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
  const setNode = (node: HTMLElement | null) => {
    root.setDescriptionNode(node);
  };
  const refHandler = ref
    ? composeRefs(
        ref as
          | ((value: HTMLElement | null) => void)
          | { current: HTMLElement | null }
          | null
          | undefined,
        setNode
      )
    : setNode;
  const finalProps = mergeProps(rest, {
    ref: refHandler,
    id: root.descriptionId,
    'data-slot': 'dialog-description',
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <p {...finalProps}>{children}</p>;
}
