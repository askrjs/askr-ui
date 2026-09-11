import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownPortal,
  DropdownTrigger,
} from '../../../../../src/components/dropdown';
import { deterministicRender } from '../../_mount';

export function dropdownMarkup() {
  return {
    renders: () => [
      deterministicRender('open dropdown', () => (
        <Dropdown defaultOpen>
          <DropdownTrigger>Open dropdown</DropdownTrigger>
          <DropdownPortal>
            <DropdownContent>
              <DropdownItem>Archive</DropdownItem>
            </DropdownContent>
          </DropdownPortal>
        </Dropdown>
      )),
    ],
  };
}
