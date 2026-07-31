export const TYPEAHEAD_RESET_MS = 500;

export type TypeaheadItem = {
  disabled: boolean;
  text: string;
};

type TypeaheadEntry = {
  cleanupSignal: AbortSignal | null;
  currentMatchIndex: number | null;
  search: string;
  suppressSpaceKeyUp: boolean;
  timer: ReturnType<typeof setTimeout> | null;
};

type TypeaheadOptions = {
  currentIndex: number;
  items: readonly TypeaheadItem[];
  onMatch: (index: number) => void;
};

const typeaheadEntries = new WeakMap<object, TypeaheadEntry>();

function getTypeaheadEntry(identity: object): TypeaheadEntry {
  const existing = typeaheadEntries.get(identity);

  if (existing) {
    return existing;
  }

  const created: TypeaheadEntry = {
    cleanupSignal: null,
    currentMatchIndex: null,
    search: '',
    suppressSpaceKeyUp: false,
    timer: null,
  };
  typeaheadEntries.set(identity, created);
  return created;
}

function clearTypeaheadEntry(entry: TypeaheadEntry) {
  if (entry.timer !== null) {
    clearTimeout(entry.timer);
    entry.timer = null;
  }

  entry.currentMatchIndex = null;
  entry.search = '';
}

function normalizeTypeaheadText(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function resolvePrintableKey(event: KeyboardEvent): string | null {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.isComposing ||
    Array.from(event.key).length !== 1
  ) {
    return null;
  }

  const target = event.target;

  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  ) {
    return null;
  }

  return event.key.toLowerCase();
}

function resolveSearchQuery(search: string): string {
  const characters = Array.from(search);
  const repeated =
    characters.length > 1 &&
    characters.every((character) => character === characters[0]);

  return repeated ? (characters[0] ?? '') : search;
}

function findTypeaheadMatch(
  items: readonly TypeaheadItem[],
  query: string,
  currentIndex: number
): number {
  if (items.length === 0 || query.length === 0) {
    return -1;
  }

  const hasCurrentIndex = currentIndex >= 0 && currentIndex < items.length;
  const excludeCurrentItem = query.length === 1 && hasCurrentIndex;
  const startIndex = hasCurrentIndex
    ? (currentIndex + (excludeCurrentItem ? 1 : 0)) % items.length
    : 0;

  for (let offset = 0; offset < items.length; offset += 1) {
    const index = (startIndex + offset) % items.length;
    const item = items[index];

    if (
      item &&
      !item.disabled &&
      normalizeTypeaheadText(item.text).startsWith(query)
    ) {
      return index;
    }
  }

  return -1;
}

export function handleTypeaheadKeyDown(
  identity: object,
  event: KeyboardEvent,
  options: TypeaheadOptions
): boolean {
  const entry = getTypeaheadEntry(identity);
  const key = resolvePrintableKey(event);

  if (event.key !== ' ') {
    entry.suppressSpaceKeyUp = false;
  }

  if (key === null || event.defaultPrevented) {
    const modifierOnly =
      event.key === 'Alt' ||
      event.key === 'AltGraph' ||
      event.key === 'CapsLock' ||
      event.key === 'Control' ||
      event.key === 'Meta' ||
      event.key === 'NumLock' ||
      event.key === 'Shift';

    if (
      key === null &&
      !modifierOnly &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.isComposing
    ) {
      clearTypeaheadEntry(entry);
    }
    return false;
  }

  if (key === ' ' && entry.search === '') {
    entry.suppressSpaceKeyUp = false;
    return false;
  }

  if (key === ' ' && entry.search !== '') {
    entry.suppressSpaceKeyUp = true;
  }

  entry.search += key;
  const query = normalizeTypeaheadText(resolveSearchQuery(entry.search));
  const currentIndex = entry.currentMatchIndex ?? options.currentIndex;
  const matchIndex = findTypeaheadMatch(options.items, query, currentIndex);

  if (entry.timer !== null) {
    clearTimeout(entry.timer);
  }
  entry.timer = setTimeout(() => {
    clearTypeaheadEntry(entry);
  }, TYPEAHEAD_RESET_MS);

  event.preventDefault();

  if (matchIndex >= 0) {
    entry.currentMatchIndex = matchIndex;

    if (matchIndex !== currentIndex) {
      options.onMatch(matchIndex);
    }
  }

  return true;
}

export function handleTypeaheadKeyUp(
  identity: object,
  event: KeyboardEvent
): boolean {
  const entry = typeaheadEntries.get(identity);

  if (
    event.key !== ' ' ||
    !entry?.suppressSpaceKeyUp ||
    event.defaultPrevented
  ) {
    return false;
  }

  entry.suppressSpaceKeyUp = false;
  event.preventDefault();
  return true;
}

export function registerTypeaheadCleanup(
  identity: object,
  signal: AbortSignal
) {
  const entry = getTypeaheadEntry(identity);

  if (entry.cleanupSignal === signal) {
    return;
  }

  entry.cleanupSignal = signal;
  signal.addEventListener(
    'abort',
    () => {
      if (entry.cleanupSignal !== signal) {
        return;
      }

      clearTypeaheadEntry(entry);
      typeaheadEntries.delete(identity);
    },
    { once: true }
  );
}

export function resetTypeahead(identity: object) {
  const entry = typeaheadEntries.get(identity);

  if (entry) {
    clearTypeaheadEntry(entry);
  }
}
