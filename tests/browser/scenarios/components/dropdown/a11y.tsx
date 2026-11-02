import {
  Dropdown,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownPortal,
  DropdownSeparator,
  DropdownTrigger,
} from '../../../../../src/components/dropdown';
import { mount } from '../../_mount';

export function axeOpenDropdown(root: HTMLElement): void {
  mount(
    <Dropdown defaultOpen>
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

export function axeGroupedDropdown(root: HTMLElement): void {
  mount(
    <Dropdown defaultOpen>
      <DropdownTrigger>Open dropdown</DropdownTrigger>
      <DropdownPortal>
        <DropdownContent>
          <DropdownGroup>
            <DropdownLabel>Actions</DropdownLabel>
            <DropdownItem>Archive</DropdownItem>
          </DropdownGroup>
          <DropdownSeparator />
          <DropdownItem>Delete</DropdownItem>
        </DropdownContent>
      </DropdownPortal>
    </Dropdown>,
    root
  );
}
