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
import { expectNoAxeViolations } from '../../accessibility';

describe('Menu and Select Components - Accessibility', () => {
  it('has no axe violations for Menu', async () => {
    await expectNoAxeViolations(
      <Menu>
        <MenuContent>
          <MenuItem>One</MenuItem>
          <MenuItem>Two</MenuItem>
        </MenuContent>
      </Menu>
    );
  });

  it('has no axe violations for DropdownMenu', async () => {
    await expectNoAxeViolations(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    );
  });

  it('has no axe violations for Select', async () => {
    await expectNoAxeViolations(
      <Select defaultOpen defaultValue="askr">
        <SelectTrigger aria-label="Framework">
          <SelectValue placeholder="Choose one" />
        </SelectTrigger>
        <SelectPortal>
          <SelectContent aria-label="Framework options">
            <SelectItem value="askr">Askr</SelectItem>
            <SelectItem value="solid">Solid</SelectItem>
          </SelectContent>
        </SelectPortal>
      </Select>
    );
  });
});
