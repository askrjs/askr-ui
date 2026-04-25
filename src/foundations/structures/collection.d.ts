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
export declare function createCollection<TNode, TMetadata = unknown>(): Collection<TNode, TMetadata>;
