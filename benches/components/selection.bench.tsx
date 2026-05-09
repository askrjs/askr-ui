import { bench, describe } from 'vite-plus/test';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownPortal,
  DropdownTrigger,
} from '../../src/components';
import { Menu, MenuContent, MenuItem } from '../../src/components';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../../src/components';

describe('Menu and Select benches', () => {
  bench('create Menu tree', () => {
    Menu({
      children: (
        <MenuContent>
          <MenuItem>One</MenuItem>
          <MenuItem>Two</MenuItem>
        </MenuContent>
      ),
    });
  });

  bench('create Dropdown tree', () => {
    Dropdown({
      defaultOpen: true,
      children: (
        <>
          <DropdownTrigger>Open dropdown</DropdownTrigger>
          <DropdownPortal>
            <DropdownContent>
              <DropdownItem>Archive</DropdownItem>
            </DropdownContent>
          </DropdownPortal>
        </>
      ),
    });
  });

  bench('create Select tree', () => {
    Select({
      defaultOpen: true,
      defaultValue: 'askr',
      children: (
        <>
          <SelectTrigger>
            <SelectValue placeholder="Choose one" />
          </SelectTrigger>
          <SelectPortal>
            <SelectContent>
              <SelectItem value="askr">Askr</SelectItem>
              <SelectItem value="solid">Solid</SelectItem>
            </SelectContent>
          </SelectPortal>
        </>
      ),
    });
  });
});
