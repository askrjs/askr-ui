import type { JSX } from '@askrjs/askr/jsx-runtime';
import {
  composeRefs,
  mergeProps,
  type Ref,
} from '@askrjs/askr/foundations/utilities';
import { Slot } from '@askrjs/askr/foundations/structures';
import { readDialogChildRef, readDialogRootContext } from './dialog.shared';
import { registerSsrPartId } from '../_internal/ssr-id-association';
import type {
  DialogDescriptionAsChildProps,
  DialogDescriptionProps,
} from './dialog.types';

/**
 * Renders the `dialog-description` part of `dialog`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function DialogDescription(props: DialogDescriptionProps): JSX.Element;
export function DialogDescription(
  props: DialogDescriptionAsChildProps
): JSX.Element;
export function DialogDescription(
  props: DialogDescriptionProps | DialogDescriptionAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readDialogRootContext();
  const childRef = asChild ? readDialogChildRef(children) : undefined;
  const setNode = (node: HTMLElement | null) => {
    root.setDescriptionNode(node);
  };
  const refHandler = composeRefs(ref as Ref<HTMLElement>, childRef, setNode);
  const finalProps = mergeProps(rest, {
    ref: refHandler,
    id: root.descriptionId,
    'data-slot': 'dialog-description',
  });
  registerSsrPartId(finalProps, root.ssrDescription);

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <p {...finalProps}>{children}</p>;
}
