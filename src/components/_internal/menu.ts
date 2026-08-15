import { getSignal, state } from '@askrjs/askr';
import { createCollection } from '@askrjs/askr/foundations/structures';
import { extractTextContent } from './jsx';

export type MenuItemMetadata = {
  index: number;
  disabled: boolean;
  value?: string;
  text: string;
};

export type MenuCollectionMetadata = {
  index: number;
  disabled: boolean;
  value?: string;
  text?: string;
};

const menuCollections = new Map<
  string,
  ReturnType<typeof createCollection<HTMLElement, MenuCollectionMetadata>>
>();
const menuCollectionRegistrations = new Map<
  string,
  {
    collection: ReturnType<
      typeof createCollection<HTMLElement, MenuCollectionMetadata>
    >;
    metadata: MenuCollectionMetadata;
    node: HTMLElement;
    owner?: object;
    unregister: () => void;
  }
>();
const menuCollectionObservers = new WeakMap<
  ReturnType<typeof createCollection<HTMLElement, MenuCollectionMetadata>>,
  Map<
    AbortSignal,
    {
      notify: () => void;
      queued: boolean;
      snapshot: Array<{ metadata: MenuCollectionMetadata; node: HTMLElement }>;
    }
  >
>();

function getMenuCollectionSnapshot(
  collection: ReturnType<
    typeof createCollection<HTMLElement, MenuCollectionMetadata>
  >
) {
  return collection
    .items()
    .slice()
    .sort((left, right) => left.metadata.index - right.metadata.index);
}

function isSameMenuCollectionSnapshot(
  left: ReturnType<typeof getMenuCollectionSnapshot>,
  right: ReturnType<typeof getMenuCollectionSnapshot>
) {
  return (
    left.length === right.length &&
    left.every(
      (item, index) =>
        item.node === right[index]?.node &&
        isSameMenuCollectionMetadata(item.metadata, right[index]!.metadata)
    )
  );
}

function notifyMenuCollectionObservers(
  collection: ReturnType<
    typeof createCollection<HTMLElement, MenuCollectionMetadata>
  >
) {
  for (const observer of menuCollectionObservers.get(collection)?.values() ??
    []) {
    observer.notify();
  }
}

export function getMenuCollection(id: string) {
  const existing = menuCollections.get(id);

  if (existing) {
    return existing;
  }

  const created = createCollection<HTMLElement, MenuCollectionMetadata>();
  menuCollections.set(id, created);
  return created;
}

export function observeMenuCollection(id: string) {
  const collection = getMenuCollection(id);
  const version = state(0);
  version();
  const signal = getSignal();
  const observers = menuCollectionObservers.get(collection) ?? new Map();
  const existing = observers.get(signal);

  if (existing) {
    existing.snapshot = getMenuCollectionSnapshot(collection);
  }

  if (!observers.has(signal)) {
    const observer = {
      queued: false,
      snapshot: getMenuCollectionSnapshot(collection),
      notify: () => {},
    };
    observer.notify = () => {
      if (observer.queued) {
        return;
      }

      observer.queued = true;
      queueMicrotask(() => {
        observer.queued = false;

        if (signal.aborted) {
          return;
        }

        const nextSnapshot = getMenuCollectionSnapshot(collection);

        if (isSameMenuCollectionSnapshot(observer.snapshot, nextSnapshot)) {
          return;
        }

        observer.snapshot = nextSnapshot;
        version.set((current) => current + 1);
      });
    };
    observers.set(signal, observer);
    menuCollectionObservers.set(collection, observers);
    signal.addEventListener(
      'abort',
      () => {
        observers.delete(signal);

        if (observers.size === 0) {
          menuCollectionObservers.delete(collection);
        }
      },
      { once: true }
    );
  }

  return collection;
}

function isSameMenuCollectionMetadata(
  left: MenuCollectionMetadata,
  right: MenuCollectionMetadata
) {
  return (
    left.index === right.index &&
    left.disabled === right.disabled &&
    left.value === right.value &&
    left.text === right.text
  );
}

export function getMenuCollectionItems(
  collection: ReturnType<
    typeof createCollection<HTMLElement, MenuCollectionMetadata>
  >
): MenuItemMetadata[] {
  return collection
    .items()
    .map((item) => ({
      index: item.metadata.index,
      disabled: item.metadata.disabled,
      value: item.metadata.value,
      text: item.metadata.text ?? '',
    }))
    .sort((left, right) => left.index - right.index);
}

export function resolveMenuItemText(
  children: unknown,
  textValue?: string
): string {
  return typeof textValue === 'string'
    ? textValue
    : extractTextContent(children).trim();
}

export function firstEnabledIndex(items: Array<{ disabled: boolean }>): number {
  const enabledIndex = items.findIndex((item) => !item.disabled);
  return enabledIndex === -1 ? 0 : enabledIndex;
}

export function registerCollectionNode(
  key: string,
  collection: ReturnType<
    typeof createCollection<HTMLElement, MenuCollectionMetadata>
  >,
  node: HTMLElement | null,
  metadata: MenuCollectionMetadata,
  owner?: object
) {
  const existing = menuCollectionRegistrations.get(key);

  if (!node) {
    if (owner && existing?.owner !== owner) {
      return;
    }
    existing?.unregister();
    menuCollectionRegistrations.delete(key);
    if (existing) {
      notifyMenuCollectionObservers(existing.collection);
    }
    return Boolean(existing);
  }

  const metadataChanged =
    !existing || !isSameMenuCollectionMetadata(existing.metadata, metadata);

  if (
    existing &&
    existing.collection === collection &&
    existing.node === node &&
    !metadataChanged
  ) {
    existing.owner = owner;
    return false;
  }

  existing?.unregister();
  menuCollectionRegistrations.set(key, {
    collection,
    metadata,
    node,
    owner,
    unregister: collection.register(node, metadata),
  });
  notifyMenuCollectionObservers(collection);
  return true;
}
