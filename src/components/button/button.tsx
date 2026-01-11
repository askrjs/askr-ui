import {
  Slot,
  type JSXElement,
  type Ref,
  pressable,
  mergeProps,
} from '@askrjs/askr/foundations';

export type ButtonOwnProps = {
  children?: unknown;
  onPress?: (e: Event) => void;
  disabled?: boolean;
};

export type ButtonButtonProps = Omit<
  JSX.IntrinsicElements['button'],
  'children' | 'onClick' | 'disabled' | 'type' | 'ref'
> &
  ButtonOwnProps & {
    asChild?: false;
    ref?: Ref<HTMLButtonElement>;
    type?: 'button' | 'submit' | 'reset';
  };

export type ButtonAsChildProps = ButtonOwnProps & {
  asChild: true;
  children: JSXElement;
  ref?: Ref<unknown>;
  type?: never;
};

export function Button(props: ButtonButtonProps): JSX.Element;
export function Button(props: ButtonAsChildProps): JSX.Element;
export function Button(props: ButtonButtonProps | ButtonAsChildProps) {
  const {
    asChild,
    children,
    onPress,
    type: typeProp,
    disabled = false,
    ref,
    ...rest
  } = props;

  const interactionProps = pressable({
    disabled,
    onPress,
    isNativeButton: !asChild,
  });

  const finalProps = mergeProps(rest, interactionProps, { ref });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  const type = typeProp ?? 'button';
  return (
    <button type={type} {...finalProps}>
      {children}
    </button>
  );
}
