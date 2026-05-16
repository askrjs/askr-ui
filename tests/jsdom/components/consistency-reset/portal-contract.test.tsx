import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogTrigger,
} from '../../../../src/components/dialog';
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../../../src/components/popover';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownPortal,
  DropdownTrigger,
} from '../../../../src/components/dropdown';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  SelectValue,
} from '../../../../src/components/select';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../../../../src/components/tooltip';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('Consistency Reset - Portal Contract', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('renders retained portal content at the root sink instead of inline', async () => {
    container = mount(
      <div>
        <Dialog key="dialog" defaultOpen>
          <DialogPortal>
            <DialogContent>Dialog body</DialogContent>
          </DialogPortal>
          <DialogTrigger>Open dialog</DialogTrigger>
        </Dialog>
        <Popover key="popover" defaultOpen>
          <PopoverPortal>
            <PopoverContent>Popover body</PopoverContent>
          </PopoverPortal>
          <PopoverTrigger>Open popover</PopoverTrigger>
        </Popover>
        <Dropdown key="dropdown" defaultOpen>
          <DropdownPortal>
            <DropdownContent>
              <DropdownItem>Archive</DropdownItem>
            </DropdownContent>
          </DropdownPortal>
          <DropdownTrigger>Open dropdown</DropdownTrigger>
        </Dropdown>
        <Select key="select" defaultOpen defaultValue="askr">
          <SelectPortal>
            <SelectContent>
              <SelectItem value="askr">Askr</SelectItem>
            </SelectContent>
          </SelectPortal>
          <SelectTrigger>
            <SelectValue placeholder="Choose one" />
          </SelectTrigger>
        </Select>
        <Tooltip key="tooltip" open>
          <TooltipPortal>
            <TooltipContent>Tooltip body</TooltipContent>
          </TooltipPortal>
          <TooltipTrigger>Tooltip trigger</TooltipTrigger>
        </Tooltip>
      </div>
    );

    await flushUpdates();

    const text = container.textContent ?? '';

    expect(text.indexOf('Open dialog')).toBeLessThan(
      text.indexOf('Dialog body')
    );
    expect(text.indexOf('Open popover')).toBeLessThan(
      text.indexOf('Popover body')
    );
    expect(text.indexOf('Open dropdown')).toBeLessThan(text.indexOf('Archive'));
    expect(text.indexOf('Tooltip trigger')).toBeLessThan(
      text.indexOf('Tooltip body')
    );
    expect(text.indexOf('Choose one')).toBeLessThan(text.lastIndexOf('Askr'));
  });
});

