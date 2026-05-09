import { describe, it } from 'vite-plus/test';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownPortal,
  DropdownTrigger,
} from '../../../src/components/composites/dropdown';
import { expectNoAxeViolations } from '../../accessibility';

describe('Dropdown - Accessibility', () => {
  it('should have no automated axe violations given open dropdown', async () => {
    await expectNoAxeViolations(
      <Dropdown defaultOpen>
        <DropdownTrigger>Open dropdown</DropdownTrigger>
        <DropdownPortal>
          <DropdownContent>
            <DropdownItem>Archive</DropdownItem>
          </DropdownContent>
        </DropdownPortal>
      </Dropdown>
    );
  });
});
