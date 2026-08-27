import { afterEach, describe, expect, it } from 'vite-plus/test';
import { OverlayHost } from '../../../../src/components/overlay-host';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../../../src/components/popover';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('OverlayHost - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => unmount(container));

  it('should retain independent portal channels when one overlay closes', async () => {
    container = mount(
      <OverlayHost>
        <Popover defaultOpen>
          <PopoverTrigger>First trigger</PopoverTrigger>
          <PopoverPortal>
            <PopoverContent aria-label="First overlay">
              First
              <PopoverClose>Close first</PopoverClose>
            </PopoverContent>
          </PopoverPortal>
        </Popover>
        <Popover defaultOpen>
          <PopoverTrigger>Second trigger</PopoverTrigger>
          <PopoverPortal>
            <PopoverContent aria-label="Second overlay">Second</PopoverContent>
          </PopoverPortal>
        </Popover>
      </OverlayHost>
    );

    await flushUpdates();
    await flushUpdates();
    expect(document.body.querySelectorAll('[data-slot="popover-content"]')).toHaveLength(2);

    (document.body.querySelector('[data-slot="popover-close"]') as HTMLElement).click();
    await flushUpdates();
    await flushUpdates();

    expect(document.body.querySelector('[aria-label="First overlay"]')).toBeNull();
    expect(document.body.querySelector('[aria-label="Second overlay"]')).not.toBeNull();
  });

  it('should remove hosted portal content when the application host unmounts', async () => {
    container = mount(
      <OverlayHost>
        <Popover defaultOpen>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverPortal>
            <PopoverContent>Hosted content</PopoverContent>
          </PopoverPortal>
        </Popover>
      </OverlayHost>
    );

    await flushUpdates();
    await flushUpdates();
    expect(document.body.querySelector('[data-slot="popover-content"]')).not.toBeNull();

    unmount(container);
    expect(document.body.querySelector('[data-slot="popover-content"]')).toBeNull();

    container = mount(<div>Replacement application</div>);
  });
});
