import { OverlayHost } from '../../../../../src/components/overlay-host';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../../src/components/popover';
import { mount } from '../../_mount';

export function axeHostedOverlay(root: HTMLElement): void {
  mount(
    <OverlayHost>
      <Popover defaultOpen>
        <PopoverTrigger>Open popover</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    </OverlayHost>,
    root
  );
}
