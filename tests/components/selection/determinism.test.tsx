import { describe, it } from 'vitest';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '../../../src/components/dropdown-menu';
import { Menu, MenuContent, MenuItem } from '../../../src/components/menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../../../src/components/select';
import { expectDeterministicRender } from '../../determinism';

describe('Menu and Select Components - Determinism', () => {
  it('renders Menu deterministically', () => {
    expectDeterministicRender(() => (
      <Menu>
        <MenuContent>
          <MenuItem>One</MenuItem>
          <MenuItem>Two</MenuItem>
        </MenuContent>
      </Menu>
    ));
  });

  it('renders DropdownMenu deterministically', () => {
    expectDeterministicRender(() => (
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    ));
  });

  it('renders Select deterministically', () => {
    expectDeterministicRender(() => (
      <Select defaultOpen defaultValue="askr">
        <SelectTrigger>
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent>
            <SelectItem value="askr">Askr</SelectItem>
            <SelectItem value="solid">Solid</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    ));
  });
});
