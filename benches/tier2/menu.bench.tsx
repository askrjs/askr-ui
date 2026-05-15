import { bench, describe } from 'vite-plus/test';
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuLabel,
  MenuSeparator,
} from '../../src/components/menu';

describe('Menu benches - default tree', () => {
  bench('create menu tree', () => {
    Menu({
      children: (
        <MenuContent>
          <MenuItem>One</MenuItem>
          <MenuItem>Two</MenuItem>
        </MenuContent>
      ),
    });
  });
});

describe('Menu benches - grouped tree', () => {
  bench('create grouped menu tree', () => {
    Menu({
      children: (
        <MenuContent>
          <MenuGroup>
            <MenuLabel>File</MenuLabel>
            <MenuItem>New</MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuItem>Close</MenuItem>
        </MenuContent>
      ),
    });
  });
});
