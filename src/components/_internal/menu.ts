import { createCollection } from '@askrjs/ui/foundations';
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
const menuCollectionUnregisters = new Map<string, () => void>();

export function getMenuCollection(id: string) {
  const existing = menuCollections.get(id);

  if (existing) {
    return existing;
  }

  const created = createCollection<HTMLElement, MenuCollectionMetadata>();
  menuCollections.set(id, created);
  return created;
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
  metadata: MenuCollectionMetadata
) {
  menuCollectionUnregisters.get(key)?.();

  if (!node) {
    menuCollectionUnregisters.delete(key);
    return;
  }

  menuCollectionUnregisters.set(key, collection.register(node, metadata));
}
