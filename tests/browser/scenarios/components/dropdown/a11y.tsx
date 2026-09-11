import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownPortal,
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
