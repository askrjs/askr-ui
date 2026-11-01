import type { JSX } from '@askrjs/askr/jsx-runtime';
import { nativeRef } from '../_internal/native-ref';
import { Slot } from '@askrjs/askr/foundations/structures';
import { focusable } from '@askrjs/askr/foundations/interactions';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import type { Ref } from '@askrjs/askr/foundations/utilities';
import { hasJsxIntrinsicType } from '../_internal/jsx';
import type {
  TextareaAsChildProps,
  TextareaElementProps,
} from './textarea.types';

function readTextareaChildRef(children: unknown): Ref<Element> | undefined {
  if (typeof children !== 'object' || children === null) return undefined;
  return (children as { props?: { ref?: Ref<Element> } }).props?.ref;
}

function resolveTextareaSlotRef(
  asChild: boolean | undefined,
  children: unknown,
  ref: Ref<Element> | undefined
): Ref<Element> | undefined {
  if (!asChild) return ref;
  const childRef = readTextareaChildRef(children);
  if (ref == null && childRef == null) return undefined;
  return composeRefs(ref, childRef);
}

/**
 * Renders the `textarea` part of `textarea`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function Textarea(props: TextareaElementProps): JSX.Element;
export function Textarea(props: TextareaAsChildProps): JSX.Element;
export function Textarea(props: TextareaElementProps | TextareaAsChildProps) {
  const {
    asChild,
    children,
    disabled: disabledProp,
    ref,
    tabIndex,
    ...rest
  } = props;
  const disabled = disabledProp ?? false;

  if (asChild && !hasJsxIntrinsicType(children, 'textarea')) {
    throw new Error('Textarea `asChild` requires a native <textarea> host.');
  }

  const focusProps =
    asChild && tabIndex === undefined && !disabled
      ? {}
      : focusable({ disabled, tabIndex });
  const normalizedRest = { ...rest } as Record<string, unknown>;
  if (disabled) delete normalizedRest['aria-disabled'];
  const finalProps = mergeProps(normalizedRest, {
    ...focusProps,
    ...(disabledProp === undefined ? {} : { disabled: disabledProp }),
    'data-slot': 'textarea',
    ...(disabledProp === undefined
      ? {}
      : { 'data-disabled': disabled ? 'true' : undefined }),
    ref: resolveTextareaSlotRef(
      asChild,
      children,
      ref as Ref<Element> | undefined
    ),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <textarea
      {...finalProps}
      disabled={disabled}
      ref={nativeRef<HTMLTextAreaElement>(props)}
    >
      {children}
    </textarea>
  );
}
