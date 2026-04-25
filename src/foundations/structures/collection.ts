/**
 * createCollection
 *
 * Ordered descendant registry for coordinating items without DOM queries.
 */

export type CollectionItem<TNode, TMetadata = unknown> = {
  node: TNode;
  metadata: TMetadata;
};

export interface Collection<TNode, TMetadata = unknown> {
  register(node: TNode, metadata: TMetadata): () => void;
  items(): ReadonlyArray<CollectionItem<TNode, TMetadata>>;
  clear(): void;
  size(): number;
}

export function createCollection<TNode, TMetadata = unknown>(): Collection<
  TNode,
  TMetadata
> {
  const registry = new Map<TNode, CollectionItem<TNode, TMetadata>>();

  function register(node: TNode, metadata: TMetadata): () => void {
    const item: CollectionItem<TNode, TMetadata> = { node, metadata };
    registry.set(node, item);

    return () => {
      registry.delete(node);
    };
  }

  function items(): ReadonlyArray<CollectionItem<TNode, TMetadata>> {
    return Array.from(registry.values());
  }

  function clear(): void {
    registry.clear();
  }

  function size(): number {
    return registry.size;
  }

  return {
    register,
    items,
    clear,
    size,
  };
}
