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
  { node: HTMLElement; owner?: object; unregister: () => void }
>();

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
    return;
  }

  existing?.unregister();
  menuCollectionRegistrations.set(key, {
    node,
    owner,
    unregister: collection.register(node, metadata),
  });
}
