import type { JSX } from '@askrjs/askr/jsx-runtime';
import { nativeButtonProps } from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { runCancelablePress } from '../_internal/press';
import { setSsrIdAssociation } from '../_internal/ssr-id-association';
import { readDialogRootContext } from './dialog.shared';
import type {
  DialogTriggerAsChildProps,
  DialogTriggerProps,
} from './dialog.types';

/**
 * Renders the `dialog-trigger` part of `dialog`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function DialogTrigger(props: DialogTriggerProps): JSX.Element;
export function DialogTrigger(props: DialogTriggerAsChildProps): JSX.Element;
export function DialogTrigger(
  props: DialogTriggerProps | DialogTriggerAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readDialogRootContext();
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      runCancelablePress(event, onPress, () => {
        root.setOpen(!root.open);
      });
    },
    isNativeButton: !asChild,
  });
  const setNode = (node: HTMLElement | null) => {
    root.setTriggerNode(
      node,
      (rest as JSX.IntrinsicElements['button'])['aria-controls'] === undefined
    );
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
    ...interactionProps,
    ref: refHandler,
    'aria-haspopup': 'dialog',
    'aria-expanded': root.open ? 'true' : 'false',
    'aria-controls': root.getContentId,
    'data-slot': 'dialog-trigger',
    'data-dialog-trigger': 'true',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': root.open ? 'open' : 'closed',
  });
  setSsrIdAssociation(
    finalProps,
    'aria-controls',
    root.ssrContent,
    (rest as JSX.IntrinsicElements['button'])['aria-controls'] === undefined
  );

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...nativeButtonProps(finalProps)}>
      {children}
    </button>
  );
}
