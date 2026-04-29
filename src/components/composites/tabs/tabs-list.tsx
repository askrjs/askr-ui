import { Slot, mergeProps, rovingFocus } from '@askrjs/ui/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import {
  disabledIndexes,
  getCompositeCollection,
} from '../../_internal/composite';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import { readTabsRootContext } from './tabs.shared';
import type { TabsListAsChildProps, TabsListProps } from './tabs.types';

export function TabsList(props: TabsListProps): JSX.Element;
export function TabsList(props: TabsListAsChildProps): JSX.Element;
export function TabsList(props: TabsListProps | TabsListAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const root = readTabsRootContext();
  const collection = getCompositeCollection(root.tabsId);
  const keyedChildren = toChildArray(children).map((child, index) => {
    if (!isJsxElement(child) || child.key != null) {
      return child;
    }

    return {
      ...child,
      key: `tabs-list-${index}`,
    };
  });
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
  const finalProps = mergeProps(rest, {
    ...nav.container,
    ref,
    role: 'tablist',
    'aria-orientation': root.orientation,
    'data-slot': 'tabs-list',
    'data-orientation': root.orientation,
    'data-tabs-list': 'true',
  });

  if (asChild) {
    return (
      <Slot
        asChild
        {...finalProps}
        children={keyedChildren as unknown as JSX.Element}
      />
    );
  }

  return <div {...finalProps}>{keyedChildren}</div>;
}
