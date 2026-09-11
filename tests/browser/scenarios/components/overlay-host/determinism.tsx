import { OverlayHost } from '../../../../../src/components/overlay-host';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../../src/components/popover';
import { deterministicRender } from '../../_mount';

export function hostedOverlayMarkup() {
  return {
    renders: () => [
      deterministicRender('hosted overlay', () => (
        <OverlayHost>
          <Popover defaultOpen>
            <PopoverTrigger>Open popover</PopoverTrigger>
            <PopoverContent>Popover body</PopoverContent>
          </Popover>
        </OverlayHost>
      )),
    ],
  };
}
