import { getSignal, state } from '@askrjs/askr';
import { watch } from '@askrjs/askr/resources';

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

function belongsToForm(node: Element, form: HTMLFormElement) {
  // Native controls can override their ancestor form with a `form` attribute.
  if ('form' in node) return node.form === form;
  return form.contains(node);
}

/** Bind a component root to its owning native form reset. */
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
  watch(
    () => onReset,
    (committedReset) => {
      entry.onReset = committedReset;
    }
  );

  if (!entry.handleReset) {
    entry.handleReset = (event) => {
      queueMicrotask(() => {
        if (
          !event.defaultPrevented &&
          event.target instanceof HTMLFormElement &&
          entry.node &&
          belongsToForm(entry.node, event.target)
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
