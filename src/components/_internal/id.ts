import { getSignal } from '@askrjs/askr';
import { formatId } from '@askrjs/askr/foundations/utilities';
import { serializeForId } from './jsx';

type AutoIdLease = {
  baseKey: string;
  ordinal: number;
  value: string;
};

const autoIdLeases = new WeakMap<AbortSignal, Map<string, AutoIdLease>>();
const activeAutoIdOrdinals = new Map<string, Set<number>>();

export function hashString(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

export function resolveCompoundId(
  prefix: string,
  explicitId: string | undefined,
  identity: unknown
): string {
  if (explicitId !== undefined) {
    return formatId({ prefix, id: explicitId });
  }

  const signal = getSignal();
  const leases = autoIdLeases.get(signal) ?? new Map<string, AutoIdLease>();
  const existing = leases.get(prefix);

  if (existing) {
    return existing.value;
  }

  const autoId = `auto-${hashString(serializeForId(identity))}`;
  const baseKey = `${prefix}\0${autoId}`;
  const activeOrdinals = activeAutoIdOrdinals.get(baseKey) ?? new Set<number>();
  let ordinal = 0;

  while (activeOrdinals.has(ordinal)) {
    ordinal += 1;
  }

  activeOrdinals.add(ordinal);
  activeAutoIdOrdinals.set(baseKey, activeOrdinals);
  const value = formatId({
    prefix,
    id: ordinal === 0 ? autoId : `${autoId}-${ordinal + 1}`,
  });
  const lease = { baseKey, ordinal, value };
  leases.set(prefix, lease);
  autoIdLeases.set(signal, leases);
  signal.addEventListener(
    'abort',
    () => {
      const current = activeAutoIdOrdinals.get(baseKey);
      current?.delete(ordinal);

      if (current?.size === 0) {
        activeAutoIdOrdinals.delete(baseKey);
      }
    },
    { once: true }
  );

  return value;
}

export function resolvePartId(rootId: string, part: string): string {
  return formatId({
    prefix: rootId,
    id: part,
  });
}
