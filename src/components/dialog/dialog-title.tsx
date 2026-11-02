import type { JSX } from '@askrjs/askr/jsx-runtime';
import {
  composeRefs,
  mergeProps,
  type Ref,
} from '@askrjs/askr/foundations/utilities';
import { Slot } from '@askrjs/askr/foundations/structures';
import { readDialogChildRef, readDialogRootContext } from './dialog.shared';
import { registerSsrPartId } from '../_internal/ssr-id-association';
import type { DialogTitleAsChildProps, DialogTitleProps } from './dialog.types';

/**
 * Renders the `dialog-title` part of `dialog`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function DialogTitle(props: DialogTitleProps): JSX.Element;
export function DialogTitle(props: DialogTitleAsChildProps): JSX.Element;
export function DialogTitle(props: DialogTitleProps | DialogTitleAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const root = readDialogRootContext();
  const childRef = asChild ? readDialogChildRef(children) : undefined;
  const setNode = (node: HTMLElement | null) => {
    root.setTitleNode(node);
  };
  const refHandler = composeRefs(ref as Ref<HTMLElement>, childRef, setNode);
  const finalProps = mergeProps(rest, {
    ref: refHandler,
    id: root.titleId,
    'data-slot': 'dialog-title',
  });
  registerSsrPartId(finalProps, root.ssrTitle);

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <h2 {...finalProps}>{children}</h2>;
}
