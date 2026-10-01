import { getSignal } from '@askrjs/askr';

const ATTRIBUTE_ROOT = Symbol.for('askr.ssr.attribute-root');
const ATTRIBUTE_CELLS = Symbol.for('askr.ssr.attribute-cells');

export const ssrAttributeRootProps = { [ATTRIBUTE_ROOT]: true };

export type SsrIdRegistration = {
  cell: { value: string | undefined };
  register: (id: unknown, signal: AbortSignal) => void;
};

/** Keep resolved part IDs until their render owner is discarded or cleaned up. */
export function createSsrIdRegistration(fallback?: string): SsrIdRegistration {
  const ids = new Map<AbortSignal, string | undefined>();
  const cell = { value: fallback };
  const update = () => {
    let value = fallback;
    for (const id of ids.values()) value = id;
    cell.value = value;
  };
  return {
    cell,
    register(id, signal) {
      if (!ids.has(signal)) {
        signal.addEventListener(
          'abort',
          function removeRenderedId() {
            ids.delete(signal);
            update();
          },
          { once: true }
        );
      }
      ids.set(
        signal,
        id === undefined || id === null || id === '' ? undefined : String(id)
      );
      update();
    },
  };
}

/** Register IDs through their normal attribute binding, preserving omission. */
export function registerSsrPartId(
  props: object,
  registration: SsrIdRegistration
) {
  const values = props as Record<string, unknown>;
  const signal = getSignal();
  const id = values.id;
  if (typeof id === 'function') {
    values.id = () => {
      const value = id();
      registration.register(value, signal);
      return value;
    };
  } else {
    registration.register(id, signal);
  }
}

/** Defer only a library-derived ARIA reference, never a caller attribute. */
export function setSsrIdAssociation(
  props: object,
  attribute: 'aria-labelledby' | 'aria-describedby' | 'aria-controls',
  registration: SsrIdRegistration,
  automatic: boolean
) {
  if (!automatic) return;
  const values = props as Record<PropertyKey, unknown>;
  const cells = values[ATTRIBUTE_CELLS] as
    | Record<string, SsrIdRegistration['cell']>
    | undefined;
  values[ATTRIBUTE_CELLS] = { ...cells, [attribute]: registration.cell };
}
