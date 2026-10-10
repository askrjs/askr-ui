import { renderToStringSync } from '@askrjs/askr/ssr';
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
  bench(
    'SSR render menu tree',
    () => {
      renderToStringSync(() => (
        <Menu
          {...{
            children: (
              <MenuContent>
                <MenuItem>One</MenuItem>
                <MenuItem>Two</MenuItem>
              </MenuContent>
            ),
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('Menu benches - grouped tree', () => {
  bench(
    'SSR render grouped menu tree',
    () => {
      renderToStringSync(() => (
        <Menu
          {...{
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
          }}
        />
      ));
    },
    { throws: true }
  );
});
