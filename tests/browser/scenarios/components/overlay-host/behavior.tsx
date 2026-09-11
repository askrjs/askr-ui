import { OverlayHost } from '../../../../../src/components/overlay-host';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '../../../../../src/components/popover';
import { flushUpdates, mount, unmount } from '../../_mount';

export async function independentPortalChannels(root: HTMLElement) {
  mount(
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
    </OverlayHost>,
    root
  );

  await flushUpdates();
  await flushUpdates();

  return {
    contentCount: () =>
      document.body.querySelectorAll('[data-slot="popover-content"]').length,
    closeFirst: async () => {
      (
        document.body.querySelector(
          '[data-slot="popover-close"]'
        ) as HTMLElement
      ).click();
      await flushUpdates();
      await flushUpdates();
    },
    overlays: () => ({
      first:
        document.body.querySelector('[aria-label="First overlay"]') !== null,
      second:
        document.body.querySelector('[aria-label="Second overlay"]') !== null,
    }),
  };
}

export async function hostUnmount(root: HTMLElement) {
  const container = mount(
    <OverlayHost>
      <Popover defaultOpen>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverPortal>
          <PopoverContent>Hosted content</PopoverContent>
        </PopoverPortal>
      </Popover>
    </OverlayHost>,
    root
  );

  await flushUpdates();
  await flushUpdates();

  return {
    hasHostedContent: () =>
      document.body.querySelector('[data-slot="popover-content"]') !== null,
    unmountHost: () => {
      unmount(container);
    },
    mountReplacement: () => {
      mount(<div>Replacement application</div>);
    },
  };
}
