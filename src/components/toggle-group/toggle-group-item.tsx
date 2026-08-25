import { nativeButtonProps } from '../_internal/native-control';
import { state } from '@askrjs/askr';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { rovingFocus } from '../_internal/roving-focus';
import {
  compositeItemFocusProps,
  repairFocusForDisabledItem,
} from '../_internal/focus';
import { runCancelablePress } from '../_internal/press';
import {
  getCompositeCollection,
  registerCompositeNode,
} from '../_internal/composite';
import {
  isDisclosureValueOpen,
  toggleDisclosureValue,
} from '../_internal/disclosure';
import { resolvePartId } from '../_internal/id';
import {
  claimVirtualCompositePlacement,
  resolveVirtualCompositePlacement,
} from '../_internal/virtual-composite';
import {
  readToggleGroupRenderContext,
  readToggleGroupRootContext,
} from './toggle-group.shared';
import type {
  ToggleGroupItemAsChildProps,
  ToggleGroupItemProps,
} from './toggle-group.types';

/**
 * Renders a part of `toggle-group`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function ToggleGroupItem(props: ToggleGroupItemProps): JSX.Element;
export function ToggleGroupItem(
  props: ToggleGroupItemAsChildProps
): JSX.Element;
export function ToggleGroupItem(
  props: ToggleGroupItemProps | ToggleGroupItemAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type,
    value,
    ...rest
  } = props;
  const root = readToggleGroupRootContext();
  const renderContext = readToggleGroupRenderContext();
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
    isDisabled: (index) => root.disabledItemIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentIndex(index);
      root.focusItem(index);
    },
  });
  const currentValue = root.getValue();
  const pressed = isDisclosureValueOpen(root.type, currentValue, value);
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      runCancelablePress(event, onPress, () => {
        const nextValue = toggleDisclosureValue(
          root.type,
          root.getValue(),
          value,
          true
        );
        root.setValue(nextValue);
        root.setCurrentIndex(itemIndex);
      });
    },
    isNativeButton: !asChild,
  });
  const itemFocusProps = nav.item(itemIndex);
  const focusRepairProps = compositeItemFocusProps();
  const registrationOwner = {};
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...itemFocusProps,
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
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
      }
    ),
    id: itemId,
    'aria-pressed': pressed ? 'true' : 'false',
    'data-slot': 'toggle-group-item',
    'data-state': pressed ? 'on' : 'off',
    'data-disabled': isDisabled ? 'true' : undefined,
    tabIndex: isDisabled ? -1 : itemFocusProps.tabIndex,
    ...focusRepairProps,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={type ?? 'button'} {...nativeButtonProps(finalProps)}>
      {children}
    </button>
  );
}
