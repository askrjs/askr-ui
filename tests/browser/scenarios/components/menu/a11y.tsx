import {
  Menu,
  MenuContent,
  MenuItem,
} from '../../../../../src/components/menu';
import { mount } from '../../_mount';

export function openMenuContent(root: HTMLElement): void {
  mount(
    <Menu>
      <MenuContent>
        <MenuItem>One</MenuItem>
        <MenuItem>Two</MenuItem>
      </MenuContent>
    </Menu>,
    root
  );
}
