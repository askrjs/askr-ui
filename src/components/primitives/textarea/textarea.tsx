import { Slot, focusable, mergeProps } from '@askrjs/ui/foundations';
import { hasJsxIntrinsicType } from '../../_internal/jsx';
import type {
  TextareaAsChildProps,
  TextareaElementProps,
} from './textarea.types';

export function Textarea(props: TextareaElementProps): JSX.Element;
export function Textarea(props: TextareaAsChildProps): JSX.Element;
export function Textarea(props: TextareaElementProps | TextareaAsChildProps) {
  const { asChild, children, disabled = false, ref, tabIndex, ...rest } = props;

  if (asChild && !hasJsxIntrinsicType(children, 'textarea')) {
    throw new Error('Textarea `asChild` requires a native <textarea> host.');
  }

  const focusProps = focusable({ disabled, tabIndex });
  const finalProps = mergeProps(rest, {
    ...focusProps,
    'data-slot': 'textarea',
    'data-disabled': disabled ? 'true' : undefined,
    disabled,
    ref,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <textarea {...finalProps} disabled={disabled}>
      {children}
    </textarea>
  );
}

