import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import {
  Dropdown,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownPortal,
  DropdownSeparator,
  DropdownTrigger,
} from '../../src/components/dropdown';
describe('Dropdown benches - default tree', () => {
  bench(
    'SSR render dropdown tree',
    () => {
      renderToStringSync(() => (
        <Dropdown
          {...{
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
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('Dropdown benches - grouped tree', () => {
  bench(
    'SSR render grouped dropdown tree',
    () => {
      renderToStringSync(() => (
        <Dropdown
          {...{
            defaultOpen: true,
            children: (
              <>
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
              </>
            ),
          }}
        />
      ));
    },
    { throws: true }
  );
});
