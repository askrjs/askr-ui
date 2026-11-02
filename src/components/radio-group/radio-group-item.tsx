import type { JSX } from '@askrjs/askr/jsx-runtime';
import {
  nativeButtonProps,
  withDefaultNativeButtonType,
} from '../_internal/native-control';
import { state } from '@askrjs/askr';
import { Slot } from '@askrjs/askr/foundations/structures';
import {
  composeRefs,
  mergeProps,
  type Ref,
} from '@askrjs/askr/foundations/utilities';
import { rovingFocus } from '../_internal/roving-focus';
import { checkablePress } from '../_internal/checkable-press';
import {
  compositeItemFocusProps,
  repairFocusForDisabledItem,
} from '../_internal/focus';
import {
  getCompositeCollection,
  registerCompositeNode,
} from '../_internal/composite';
import { resolvePartId } from '../_internal/id';
import {
  claimVirtualCompositePlacement,
  resolveVirtualCompositePlacement,
} from '../_internal/virtual-composite';
import {
  readRadioGroupRenderContext,
  readRadioGroupRootContext,
} from './radio-group.shared';
import type {
  RadioGroupItemAsChildProps,
  RadioGroupItemProps,
} from './radio-group.types';

function readRadioGroupItemChildRef(
  children: unknown
): Ref<Element> | undefined {
  if (typeof children !== 'object' || children === null) return undefined;
  return (children as { props?: { ref?: Ref<Element> } }).props?.ref;
}

function omitRadioGroupItemStateProps<T extends object>(props: T): T {
  let result: T | undefined;
  for (const attribute of [
    'id',
    'role',
    'aria-checked',
    'aria-disabled',
    'data-slot',
    'data-disabled',
    'data-state',
    'data-roving-index',
    'tabIndex',
  ]) {
    if (!Object.prototype.hasOwnProperty.call(props, attribute)) continue;
    result ??= { ...props };
    delete (result as Record<string, unknown>)[attribute];
  }
  return result ?? props;
}

/**
 * Renders the `radio-group-item` part of `radio-group` with `role="radio"`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function RadioGroupItem(props: RadioGroupItemProps): JSX.Element;
export function RadioGroupItem(props: RadioGroupItemAsChildProps): JSX.Element;
export function RadioGroupItem(
  props: RadioGroupItemProps | RadioGroupItemAsChildProps
) {
  const { asChild, children, value, disabled = false, ref, ...rest } = props;
  const idProp = (rest as { id?: string }).id;
  const root = readRadioGroupRootContext();
  const renderContext = readRadioGroupRenderContext();
  const placement = state<{ index: number; setSize?: number }>({ index: -1 })();
  const scopedVirtualPlacement = claimVirtualCompositePlacement(
    placement,
    renderContext.claimItemIndex,
    renderContext.virtualIdentity
  );
  const itemIndex = scopedVirtualPlacement?.index ?? placement.index;
  const itemId = resolvePartId(root.groupId, `item-${itemIndex}`);
  const collection = getCompositeCollection(root.groupId);
  const isDisabled = root.disabled || disabled;
  const nav = rovingFocus({
    currentIndex: root.currentIndex,
    itemCount: Math.max(root.itemCount, 1),
    orientation: root.orientation,
    loop: root.loop,
    isDisabled: (index) => root.disabledIndexes.includes(index),
    onNavigate: (index) => {
      const next = root.items.find((item) => item.index === index)?.value;

      root.setCurrentIndex(index);
      root.focusItem(index);

      if (next !== undefined) {
        root.setValue(next);
      }
    },
  });
  const checked = root.value === value;
  const interactionProps = checkablePress({
    disabled: isDisabled,
    onPress: () => {
      root.setValue(value);
      root.setCurrentIndex(itemIndex);
    },
  });
  const itemFocusProps = nav.item(itemIndex);
  const focusRepairProps = compositeItemFocusProps();
  const registrationOwner = {};
  const setNode = (node: HTMLElement | null) => {
    const virtualPlacement =
      scopedVirtualPlacement ??
      (node ? resolveVirtualCompositePlacement(node) : null);
    if (virtualPlacement && !scopedVirtualPlacement) {
      placement.index = virtualPlacement.index;
      placement.setSize = virtualPlacement.setSize;
    }
    const resolvedIndex = virtualPlacement?.index ?? itemIndex;
    const changed = registerCompositeNode(
      itemId,
      collection,
      node,
      {
        index: resolvedIndex,
        setSize: virtualPlacement?.setSize ?? placement.setSize,
        disabled: isDisabled,
        value,
      },
      registrationOwner
    );

    if (changed) {
      root.scheduleItemsSync();
    }
    root.restoreItemFocus(resolvedIndex, node);
    repairFocusForDisabledItem({
      collection,
      disabled: isDisabled,
      index: resolvedIndex,
      loop: root.loop,
      node,
      setCurrentIndex: root.setCurrentIndex,
    });
  };
  const refHandler = composeRefs(
    ref as Ref<HTMLElement> | undefined,
    (asChild ? readRadioGroupItemChildRef(children) : undefined) as
      | Ref<HTMLElement>
      | undefined,
    setNode
  );
  const finalProps = mergeProps(
    {
      ...interactionProps,
      ...itemFocusProps,
      ...focusRepairProps,
      ref: refHandler,
      id: idProp ?? itemId,
      role: 'radio',
      ...(isDisabled && !asChild ? { disabled: true } : {}),
      'aria-checked': checked ? 'true' : 'false',
      'data-slot': 'radio-group-item',
      'data-disabled': isDisabled ? 'true' : undefined,
      'data-state': checked ? 'checked' : 'unchecked',
      tabIndex: isDisabled ? -1 : itemFocusProps.tabIndex,
      value,
    },
    omitRadioGroupItemStateProps(rest)
  );

  if (asChild) {
    return (
      <Slot
        asChild
        {...withDefaultNativeButtonType(children, finalProps)}
        children={children}
      />
    );
  }

  return (
    <button type="button" {...nativeButtonProps(finalProps)}>
      {children}
    </button>
  );
}
