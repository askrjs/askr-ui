import { getSignal, state } from '@askrjs/askr';
import { createCollection } from '@askrjs/askr/foundations/structures';

export type CompositeCollectionMetadata = {
  index: number;
  disabled: boolean;
  value?: string;
  text?: string;
};

const compositeCollections = new Map<
  string,
  ReturnType<typeof createCollection<HTMLElement, CompositeCollectionMetadata>>
>();
const compositeRegistrations = new Map<
  string,
  {
    collection: ReturnType<
      typeof createCollection<HTMLElement, CompositeCollectionMetadata>
    >;
    node: HTMLElement;
    metadata: CompositeCollectionMetadata;
    owner?: object;
    unregister: () => void;
  }
>();
const compositeObservers = new WeakMap<
  ReturnType<typeof createCollection<HTMLElement, CompositeCollectionMetadata>>,
  Map<
    AbortSignal,
    {
      notify: () => void;
      queued: boolean;
      snapshot: Array<{
        metadata: CompositeCollectionMetadata;
        node: HTMLElement;
      }>;
    }
  >
>();

function getCompositeSnapshot(
  collection: ReturnType<
    typeof createCollection<HTMLElement, CompositeCollectionMetadata>
  >
) {
  return collection
    .items()
    .slice()
    .sort((left, right) => left.metadata.index - right.metadata.index);
}

function isSameCompositeSnapshot(
  left: ReturnType<typeof getCompositeSnapshot>,
  right: ReturnType<typeof getCompositeSnapshot>
) {
  return (
    left.length === right.length &&
    left.every(
      (item, index) =>
        item.node === right[index]?.node &&
        isSameCompositeMetadata(item.metadata, right[index]!.metadata)
    )
  );
}

function notifyCompositeObservers(
  collection: ReturnType<
    typeof createCollection<HTMLElement, CompositeCollectionMetadata>
  >
) {
  for (const observer of compositeObservers.get(collection)?.values() ?? []) {
    observer.notify();
  }
}

export function getCompositeCollection(id: string) {
  const existing = compositeCollections.get(id);

  if (existing) {
    return existing;
  }

  const created = createCollection<HTMLElement, CompositeCollectionMetadata>();
  compositeCollections.set(id, created);
  return created;
}

export function observeCompositeCollection(id: string) {
  const collection = getCompositeCollection(id);
  const version = state(0);
  version();
  const signal = getSignal();
  const observers = compositeObservers.get(collection) ?? new Map();
  const existing = observers.get(signal);

  if (existing) {
    existing.snapshot = getCompositeSnapshot(collection);
  }

  if (!observers.has(signal)) {
    const observer = {
      queued: false,
      snapshot: getCompositeSnapshot(collection),
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

        const nextSnapshot = getCompositeSnapshot(collection);

        if (isSameCompositeSnapshot(observer.snapshot, nextSnapshot)) {
          return;
        }

        observer.snapshot = nextSnapshot;
        version.set((current) => current + 1);
      });
    };
    observers.set(signal, observer);
    compositeObservers.set(collection, observers);
    signal.addEventListener(
      'abort',
      () => {
        observers.delete(signal);

        if (observers.size === 0) {
          compositeObservers.delete(collection);
        }
      },
      { once: true }
    );
  }

  return collection;
}

export function getCompositeCollectionItems(
  collection: ReturnType<
    typeof createCollection<HTMLElement, CompositeCollectionMetadata>
  >
): CompositeCollectionMetadata[] {
  return collection
    .items()
    .map((item) => item.metadata)
    .sort((left, right) => left.index - right.index);
}

function isSameCompositeMetadata(
  left: CompositeCollectionMetadata,
  right: CompositeCollectionMetadata
): boolean {
  return (
    left.index === right.index &&
    left.disabled === right.disabled &&
    left.value === right.value &&
    left.text === right.text
  );
}

export function registerCompositeNode(
  key: string,
  collection: ReturnType<
    typeof createCollection<HTMLElement, CompositeCollectionMetadata>
  >,
  node: HTMLElement | null,
  metadata: CompositeCollectionMetadata,
  owner?: object
): boolean {
  const existing = compositeRegistrations.get(key);

  if (!node) {
    if (owner && existing?.owner !== owner) {
      return false;
    }
    existing?.unregister();
    compositeRegistrations.delete(key);
    if (existing) {
      notifyCompositeObservers(existing.collection);
    }
    return Boolean(existing);
  }

  const metadataChanged =
    !existing || !isSameCompositeMetadata(existing.metadata, metadata);

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

  const unregister = collection.register(node, metadata);

  compositeRegistrations.set(key, {
    collection,
    node,
    metadata,
    owner,
    unregister,
  });
  notifyCompositeObservers(collection);

  return true;
}

export function firstEnabledCompositeIndex(
  items: Array<{ disabled?: boolean }>
): number {
  const index = items.findIndex((item) => !item.disabled);
  return index === -1 ? 0 : index;
}

export function disabledIndexes(
  items: Array<{ disabled?: boolean }>
): number[] {
  return items
    .map((item, index) => (item.disabled ? index : -1))
    .filter((index) => index !== -1);
}
