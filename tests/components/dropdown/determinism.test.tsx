import { describe, it } from 'vite-plus/test';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownPortal,
  DropdownTrigger,
} from '../../../src/components/composites/dropdown';
import { expectDeterministicRender } from '../../determinism';

describe('Dropdown - Determinism', () => {
  it('should render deterministic dropdown markup', () => {
    expectDeterministicRender(() => (
      <Dropdown defaultOpen>
        <DropdownTrigger>Open dropdown</DropdownTrigger>
        <DropdownPortal>
          <DropdownContent>
            <DropdownItem>Archive</DropdownItem>
          </DropdownContent>
        </DropdownPortal>
      </Dropdown>
    ));
  });
});
