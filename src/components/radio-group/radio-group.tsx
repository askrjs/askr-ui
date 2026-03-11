import {
  Slot,
  controllableState,
  mergeProps,
  pressable,
  rovingFocus,
} from '@askrjs/askr/foundations';
import type {
  RadioGroupItemAsChildProps,
  RadioGroupItemProps,
  RadioGroupProps,
} from './radio-group.types';

type RadioGroupContext = {
  valueState: ReturnType<typeof controllableState<string>>;
  disabled: boolean;
  orientation: 'horizontal' | 'vertical' | 'both';
  loop: boolean;
  itemValues: string[];
  itemCursor: number;
};

const radioGroupStack: RadioGroupContext[] = [];

function readRadioGroupContext(): RadioGroupContext {
  const ctx = radioGroupStack[radioGroupStack.length - 1];
  if (!ctx) {
    throw new Error('RadioGroupItem must be used within <RadioGroup>');
  }
  return ctx;
}

export function RadioGroup(props: RadioGroupProps) {
  const {
    children,
    value,
    defaultValue = '',
    onValueChange,
    disabled = false,
    name,
    orientation = 'vertical',
    loop = true,
    ref,
    ...rest
  } = props;

  const valueState = controllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const ctx: RadioGroupContext = {
    valueState,
    disabled,
    orientation,
    loop,
    itemValues: [],
    itemCursor: 0,
  };

  radioGroupStack.push(ctx);

  try {
    const currentIndex = Math.max(0, ctx.itemValues.indexOf(valueState()));
    const nav = rovingFocus({
      currentIndex,
      itemCount: Math.max(ctx.itemValues.length, 1),
      orientation,
      loop,
      onNavigate: (index) => {
        const next = ctx.itemValues[index];
        if (next) {
          valueState.set(next);
        }
      },
    });

    const finalProps = mergeProps(rest, {
      ...nav.container,
      ref,
      role: 'radiogroup',
      'aria-orientation': orientation === 'both' ? undefined : orientation,
    });

    return (
      <div {...finalProps}>
        {children}
        {name ? (
          <input type="hidden" name={name} value={valueState()} disabled={disabled} />
        ) : null}
      </div>
    );
  } finally {
    radioGroupStack.pop();
  }
}

export function RadioGroupItem(props: RadioGroupItemProps): JSX.Element;
export function RadioGroupItem(props: RadioGroupItemAsChildProps): JSX.Element;
export function RadioGroupItem(
  props: RadioGroupItemProps | RadioGroupItemAsChildProps
) {
  const ctx = readRadioGroupContext();
  const { asChild, children, value, disabled = false, ref, ...rest } = props;
  const index = ctx.itemCursor++;
  ctx.itemValues[index] = value;
  const checked = ctx.valueState() === value;

  const nav = rovingFocus({
    currentIndex: Math.max(0, ctx.itemValues.indexOf(ctx.valueState())),
    itemCount: Math.max(ctx.itemValues.length, index + 1),
    orientation: ctx.orientation,
    loop: ctx.loop,
    onNavigate: (nextIndex) => {
      const next = ctx.itemValues[nextIndex];
      if (next) {
        ctx.valueState.set(next);
      }
    },
  });

  const interactionProps = pressable({
    disabled: ctx.disabled || disabled,
    onPress: () => ctx.valueState.set(value),
    isNativeButton: !asChild,
  });

  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...nav.item(index),
    ref,
    role: asChild ? 'radio' : undefined,
    'aria-checked': checked ? 'true' : 'false',
    'data-state': checked ? 'checked' : 'unchecked',
    value,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type="button" {...finalProps}>
      {children}
    </button>
  );
}
