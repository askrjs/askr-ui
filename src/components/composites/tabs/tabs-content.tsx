import { Presence, Slot, mergeProps } from '@askrjs/askr-ui/foundations';
import {
  getTabsContentId,
  getTabsTriggerId,
  readTabsRootContext,
} from './tabs.shared';
import type { TabsContentAsChildProps, TabsContentProps } from './tabs.types';

export function TabsContent(props: TabsContentProps): JSX.Element | null;
export function TabsContent(props: TabsContentAsChildProps): JSX.Element | null;
export function TabsContent(props: TabsContentProps | TabsContentAsChildProps) {
  const { asChild, children, forceMount = false, ref, value, ...rest } = props;
  const root = readTabsRootContext();
  const selected = root.value === value;
  const triggerId = getTabsTriggerId(root.tabsId, value);
  const contentId = getTabsContentId(root.tabsId, value);
  const finalProps = mergeProps(rest, {
    ref,
    id: contentId,
    role: 'tabpanel',
    'aria-labelledby': triggerId,
    'data-slot': 'tabs-content',
    'data-state': selected ? 'active' : 'inactive',
  });

  return (
    <Presence present={forceMount || selected}>
      {asChild ? (
        <Slot asChild {...finalProps} children={children} />
      ) : (
        <div {...finalProps}>{children}</div>
      )}
    </Presence>
  );
}
