import { createCollection } from '@askrjs/ui/foundations';

export type CompositeCollectionMetadata = {
  index: number;
  disabled: boolean;
  value?: string;
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
    unregister: () => void;
  }
>();

export function getCompositeCollection(id: string) {
  const existing = compositeCollections.get(id);

  if (existing) {
    return existing;
  }

  const created = createCollection<HTMLElement, CompositeCollectionMetadata>();
  compositeCollections.set(id, created);
  return created;
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
    left.value === right.value
  );
}

export function registerCompositeNode(
  key: string,
  collection: ReturnType<
    typeof createCollection<HTMLElement, CompositeCollectionMetadata>
  >,
  node: HTMLElement | null,
  metadata: CompositeCollectionMetadata
): boolean {
  const existing = compositeRegistrations.get(key);

  if (!node) {
    existing?.unregister();
    compositeRegistrations.delete(key);
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
    return false;
  }

  existing?.unregister();

  const unregister = collection.register(node, metadata);

  compositeRegistrations.set(key, {
    collection,
    node,
    metadata,
    unregister,
  });

  return metadataChanged;
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

