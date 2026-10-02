import { state } from '@askrjs/askr';
import { watch } from '@askrjs/askr/resources';
import { focusFirstDescendant } from './focus';

/** Keep focus transitions working when presence retains the content node. */
export function syncPersistentOverlayFocus(
  open: boolean,
  forceMount: boolean,
  getContentNode: () => HTMLElement | null,
  getRestoreTarget: () => HTMLElement | null
) {
  const entry = state({
    previousFocused:
      typeof document !== 'undefined' &&
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null,
  })();

  watch(
    () => [open, forceMount] as const,
    ([isOpen, persistent], { previous }) => {
      if (!persistent) return;
      const content = getContentNode();
      if (isOpen && !previous?.[0]) {
        const active =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        if (content && !content.contains(active)) {
          entry.previousFocused = active;
          if (!focusFirstDescendant(content)) content.focus();
        }
      } else if (!isOpen && previous?.[0]) {
        const target = getRestoreTarget() ?? entry.previousFocused;
        if (target?.isConnected && !target.hasAttribute('disabled')) {
          target.focus();
        }
      }
    }
  );
}
