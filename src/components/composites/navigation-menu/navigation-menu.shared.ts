import { defineContext, readContext } from '@askrjs/askr';
import type { OverlayPortal } from '../../_internal/overlay';

export type NavigationMenuPositionOptions = {
  side: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  sideOffset: number;
};

export type NavigationMenuRootContextValue = {
  navigationMenuId: string;
  openPath: string[];
  setOpenPath: (path: string[]) => void;
  loop: boolean;
  currentTriggerIndex: number;
  setCurrentTriggerIndex: (index: number) => void;
  triggerCount: number;
  disabledTriggerIndexes: number[];
  portal: OverlayPortal;
};

export type NavigationMenuItemContextValue = {
  itemKey: string;
  itemIndex: number;
  triggerId: string;
  contentId: string;
  path: string[];
};

export type NavigationMenuContentContextValue = {
  contentCurrentIndex: number;
  setContentCurrentIndex: (index: number) => void;
  contentItemCount: number;
  contentDisabledIndexes: number[];
  contentId: string;
};

export const NavigationMenuRootContext =
  defineContext<NavigationMenuRootContextValue | null>(null);

export const NavigationMenuItemContext =
  defineContext<NavigationMenuItemContextValue | null>(null);

export const NavigationMenuContentContext =
  defineContext<NavigationMenuContentContextValue | null>(null);

export function readNavigationMenuRootContext(): NavigationMenuRootContextValue {
  const context = readContext(NavigationMenuRootContext);

  if (!context) {
    throw new Error('NavigationMenu components must be used within <NavigationMenu>');
  }

  return context;
}

export function readNavigationMenuItemContext(): NavigationMenuItemContextValue {
  const context = readContext(NavigationMenuItemContext);

  if (!context) {
    throw new Error('NavigationMenuItem components must be used within <NavigationMenuItem>');
  }

  return context;
}

export function readNavigationMenuContentContext(): NavigationMenuContentContextValue {
  const context = readContext(NavigationMenuContentContext);

  if (!context) {
    throw new Error('NavigationMenu content components must be used within <NavigationMenuContent>');
  }

  return context;
}

export function resolveNavigationMenuPositionOptions(
  options: Partial<NavigationMenuPositionOptions> = {}
): NavigationMenuPositionOptions {
  return {
    side: options.side ?? 'bottom',
    align: options.align ?? 'start',
    sideOffset: options.sideOffset ?? 0,
  };
}
