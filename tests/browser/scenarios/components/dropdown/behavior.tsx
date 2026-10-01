import type { JSX } from '@askrjs/askr/jsx-runtime';
import { state } from '@askrjs/askr';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownPortal,
  DropdownTrigger,
} from '../../../../../src/components/dropdown';
import { flushUpdates, mount, spy } from '../../_mount';

export function toggleExpansion(root: HTMLElement): void {
  mount(
    <Dropdown>
      <DropdownTrigger>Open dropdown</DropdownTrigger>
      <DropdownPortal>
        <DropdownContent>
          <DropdownItem>Archive</DropdownItem>
        </DropdownContent>
      </DropdownPortal>
    </Dropdown>,
    root
  );
}

export async function focusedItemDisabled(root: HTMLElement) {
  let disabled!: ReturnType<typeof state<boolean>>;
  function DynamicDropdown() {
    disabled = state(false);
    return (
      <Dropdown defaultOpen>
        <DropdownTrigger>Open dropdown</DropdownTrigger>
        <DropdownPortal>
          <DropdownContent>
            <DropdownItem disabled={disabled()}>Archive</DropdownItem>
            <DropdownItem>Delete</DropdownItem>
          </DropdownContent>
        </DropdownPortal>
      </Dropdown>
    );
  }

  mount(<DynamicDropdown />, root);
  await flushUpdates();
  await flushUpdates();
  return {
    disableArchive: async () => {
      disabled.set(true);
      await flushUpdates();
      await flushUpdates();
    },
  };
}

export async function themedVariants(root: HTMLElement): Promise<void> {
  mount(
    <Dropdown defaultOpen>
      <DropdownTrigger variant="ghost" size="icon" aria-label="Open menu">
        Menu
      </DropdownTrigger>
      <DropdownPortal>
        <DropdownContent>
          <DropdownItem variant="destructive" asChild>
            <a href="/logout">Sign out</a>
          </DropdownItem>
        </DropdownContent>
      </DropdownPortal>
    </Dropdown>,
    root
  );
  await flushUpdates();
}

export async function nestedComposition(root: HTMLElement): Promise<void> {
  mount(
    <Dropdown defaultOpen>
      <DropdownTrigger>Open dropdown</DropdownTrigger>
      <DropdownPortal>
        <DropdownContent>
          <div>
            <DropdownItem>Archive</DropdownItem>
          </div>
          <div>
            <DropdownItem>Delete</DropdownItem>
          </div>
        </DropdownContent>
      </DropdownPortal>
    </Dropdown>,
    root
  );
  await flushUpdates();
  await flushUpdates();
}

export async function allItemsDisabled(root: HTMLElement): Promise<void> {
  mount(
    <Dropdown defaultOpen>
      <DropdownTrigger>Open dropdown</DropdownTrigger>
      <DropdownPortal>
        <DropdownContent>
          <DropdownItem disabled>Archive</DropdownItem>
          <DropdownItem disabled>Delete</DropdownItem>
        </DropdownContent>
      </DropdownPortal>
    </Dropdown>,
    root
  );
  await flushUpdates();
  await flushUpdates();
}

export function menuButton(root: HTMLElement) {
  const onArchiveSelect = spy();
  mount(
    <div>
      <Dropdown>
        <DropdownTrigger>Open database menu</DropdownTrigger>
        <DropdownPortal>
          <DropdownContent>
            <DropdownItem>Alpha</DropdownItem>
            <DropdownItem textValue="Database1" disabled>
              Disabled database
            </DropdownItem>
            <DropdownItem textValue="Database2">Primary database</DropdownItem>
            <DropdownItem
              asChild
              textValue="Database Archive"
              onSelect={onArchiveSelect}
            >
              <span>Archived database</span>
            </DropdownItem>
          </DropdownContent>
        </DropdownPortal>
      </Dropdown>
      <button type="button" data-testid="after-dropdown">
        After dropdown
      </button>
    </div>,
    root
  );
  return { archiveSelectCount: () => onArchiveSelect.count() };
}

export async function asChildSpace(root: HTMLElement) {
  const onSelect = spy();
  mount(
    <Dropdown defaultOpen>
      <DropdownTrigger>Open</DropdownTrigger>
      <DropdownPortal>
        <DropdownContent>
          <DropdownItem asChild onSelect={onSelect}>
            <span>Archive</span>
          </DropdownItem>
        </DropdownContent>
      </DropdownPortal>
    </Dropdown>,
    root
  );
  await flushUpdates();
  await flushUpdates();
  return { selectCount: () => onSelect.count() };
}

function captureMountError(element: JSX.Element, root: HTMLElement): string {
  try {
    mount(element, root);
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
  return '';
}

export function orphanContent(root: HTMLElement) {
  const message = captureMountError(
    <DropdownPortal>
      <DropdownContent>
        <DropdownItem>Orphan</DropdownItem>
      </DropdownContent>
    </DropdownPortal>,
    root
  );
  return { message: () => message };
}

export function itemWithinDropdown(root: HTMLElement): void {
  mount(
    <Dropdown defaultOpen>
      <DropdownTrigger>Open</DropdownTrigger>
      <DropdownPortal>
        <DropdownItem>Orphan</DropdownItem>
      </DropdownPortal>
    </Dropdown>,
    root
  );
}

export function orphanTrigger(root: HTMLElement) {
  const message = captureMountError(
    <DropdownTrigger>Orphan</DropdownTrigger>,
    root
  );
  return { message: () => message };
}

export async function rtlVertical(root: HTMLElement): Promise<void> {
  mount(
    <div dir="rtl">
      <Dropdown defaultOpen>
        <DropdownTrigger>Open dropdown</DropdownTrigger>
        <DropdownPortal>
          <DropdownContent>
            <DropdownItem>Archive</DropdownItem>
            <DropdownItem>Duplicate</DropdownItem>
          </DropdownContent>
        </DropdownPortal>
      </Dropdown>
    </div>,
    root
  );
  await flushUpdates();
  await flushUpdates();
}
