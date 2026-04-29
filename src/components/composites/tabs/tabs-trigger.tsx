import {
  Slot,
  composeRefs,
  mergeProps,
  pressable,
  rovingFocus,
} from '@askrjs/ui/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import {
  disabledIndexes,
  getCompositeCollection,
  registerCompositeNode,
} from '../../_internal/composite';
import {
  getTabsContentId,
  getTabsTriggerId,
  readTabsRenderContext,
  readTabsRootContext,
} from './tabs.shared';
import type { TabsTriggerAsChildProps, TabsTriggerProps } from './tabs.types';

export function TabsTrigger(props: TabsTriggerProps): JSX.Element;
export function TabsTrigger(props: TabsTriggerAsChildProps): JSX.Element;
export function TabsTrigger(props: TabsTriggerProps | TabsTriggerAsChildProps) {
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
  const root = readTabsRootContext();
  const renderContext = readTabsRenderContext();
  const itemIndex = renderContext.claimTriggerIndex();
  const triggerId = getTabsTriggerId(root.tabsId, value);
  const contentId = getTabsContentId(root.tabsId, value);
  const collection = getCompositeCollection(root.tabsId);
  const isDisabled = disabled;
  const disabledItemIndexes = disabledIndexes(root.items);
  const nav = rovingFocus({
    currentIndex: root.currentIndex,
    itemCount: Math.max(root.items.length, 1),
    orientation: root.orientation,
    loop: root.loop,
    isDisabled: (index) => disabledItemIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const selected = root.value === value;
  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        root.setValue(value);
        root.setCurrentIndex(itemIndex);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...nav.item(itemIndex),
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        const changed = registerCompositeNode(triggerId, collection, node, {
          index: itemIndex,
          disabled: isDisabled,
          value,
        });

        if (changed) {
          root.scheduleItemsSync();
        }
      }
    ),
    id: triggerId,
    role: 'tab',
    'aria-selected': selected ? 'true' : 'false',
    'aria-controls': contentId,
    'data-slot': 'tabs-trigger',
    'data-state': selected ? 'active' : 'inactive',
    'data-disabled': isDisabled ? 'true' : undefined,
    onFocus: () => {
      root.setCurrentIndex(itemIndex);

      if (root.activationMode === 'automatic' && !isDisabled) {
        root.setValue(value);
      }
    },
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={type ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}

