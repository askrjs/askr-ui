import { getSignal, state } from '@askrjs/askr';

type FormResetEntry = {
  node: Element | null;
  document: Document | null;
  onReset: () => void;
  handleReset: ((event: Event) => void) | null;
  cleanupSignal: AbortSignal | null;
};

function detachFormReset(entry: FormResetEntry) {
  if (entry.document && entry.handleReset) {
    entry.document.removeEventListener('reset', entry.handleReset, true);
  }
  entry.node = null;
  entry.document = null;
}

/** Bind an uncontrolled component root to its nearest native form reset. */
export function formResetRef<T extends Element = HTMLElement>(
  onReset: () => void
) {
  const entry = state<FormResetEntry>({
    node: null,
    document: null,
    onReset,
    handleReset: null,
    cleanupSignal: null,
  })();
  entry.onReset = onReset;

  if (!entry.handleReset) {
    entry.handleReset = (event) => {
      queueMicrotask(() => {
        if (
          !event.defaultPrevented &&
          event.target instanceof HTMLFormElement &&
          entry.node &&
          event.target.contains(entry.node)
        ) {
          entry.onReset();
        }
      });
    };
  }

  const signal = getSignal();
  if (entry.cleanupSignal !== signal) {
    entry.cleanupSignal = signal;
    signal.addEventListener('abort', () => detachFormReset(entry), {
      once: true,
    });
  }

  return (node: T | null) => {
    const nextDocument = node?.ownerDocument ?? null;
    if (entry.node === node && entry.document === nextDocument) {
      return;
    }

    detachFormReset(entry);
    entry.node = node;
    entry.document = nextDocument;
    if (entry.document && entry.handleReset) {
      entry.document.addEventListener('reset', entry.handleReset, true);
    }
  };
}
