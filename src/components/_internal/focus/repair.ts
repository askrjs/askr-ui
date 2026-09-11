import type { Collection } from '@askrjs/askr/foundations/structures';
import { getCompositeItemFocusTracker } from './composite';

export function repairFocusForDisabledItem<
  TMetadata extends { disabled: boolean; index: number },
>(options: {
  collection: Collection<HTMLElement, TMetadata>;
  current?: boolean;
  disabled: boolean;
  index: number;
  loop: boolean;
  node: HTMLElement | null;
  setCurrentIndex: (index: number) => void;
}) {
  const { collection, current, disabled, index, loop, node, setCurrentIndex } =
    options;

  if (!node) {
    return;
  }

  const tracker = getCompositeItemFocusTracker(node);
  const becameDisabled = disabled && !tracker.disabled;
  tracker.disabled = disabled;

  if (
    !becameDisabled ||
    (!tracker.focused && !current) ||
    tracker.repairQueued
  ) {
    return;
  }

  tracker.repairQueued = true;
  queueMicrotask(() => {
    tracker.repairQueued = false;

    if (!tracker.disabled) {
      return;
    }

    const activeElement = document.activeElement;
    if (
      activeElement instanceof HTMLElement &&
      activeElement !== node &&
      activeElement !== document.body &&
      activeElement.isConnected
    ) {
      tracker.focused = false;
      return;
    }

    const items = collection
      .items()
      .slice()
      .sort((left, right) => left.metadata.index - right.metadata.index);
    const currentPosition = items.findIndex(
      (item) => item.metadata.index === index
    );
    const following = items
      .slice(currentPosition + 1)
      .find((item) => !item.metadata.disabled);
    const wrapped = loop
      ? items
          .slice(0, Math.max(currentPosition, 0))
          .find((item) => !item.metadata.disabled)
      : undefined;
    const preceding = !loop
      ? items
          .slice(0, Math.max(currentPosition, 0))
          .reverse()
          .find((item) => !item.metadata.disabled)
      : undefined;
    const target = following ?? wrapped ?? preceding;

    tracker.focused = false;

    if (!target?.node.isConnected) {
      if (
        activeElement instanceof HTMLElement &&
        activeElement.hasAttribute('disabled')
      ) {
        activeElement.blur();
      }
      return;
    }

    setCurrentIndex(target.metadata.index);
    target.node.focus();
  });
}
