import {
  Menu,
  MenuContent,
  MenuItem,
} from '../../../../../src/components/menu';
import { deterministicRender } from '../../_mount';

export function menuMarkup() {
  return {
    renders: () => [
      deterministicRender('menu with two items', () => (
        <Menu>
          <MenuContent>
            <MenuItem>One</MenuItem>
            <MenuItem>Two</MenuItem>
          </MenuContent>
        </Menu>
      )),
    ],
  };
}
