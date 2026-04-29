import { For } from '@askrjs/askr';
import { Slot, mergeProps } from '@askrjs/ui/foundations';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import type { LabelAsChildProps, LabelLabelProps } from './label.types';

export function Label(props: LabelLabelProps): JSX.Element;
export function Label(props: LabelAsChildProps): JSX.Element;
export function Label(props: LabelLabelProps | LabelAsChildProps) {
  if (props.asChild) {
    const { asChild: _asChild, children, ref, ...rest } = props;
    const finalProps = mergeProps(rest, { ref, 'data-slot': 'label' });

    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  const { children, ref, htmlFor, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'label',
    ...(htmlFor !== undefined ? { for: htmlFor } : {}),
  });
  const keyedChildren = (
    <For
      each={() => toChildArray(children)}
      by={(child, index) =>
        isJsxElement(child) && child.key != null ? child.key : index
      }
    >
      {(child) => child as never}
    </For>
  );

  return <label {...finalProps}>{keyedChildren}</label>;
}

