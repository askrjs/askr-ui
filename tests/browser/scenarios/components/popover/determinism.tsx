import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../../src/components/popover';
import { deterministicRender } from '../../_mount';

export function popoverMarkup() {
  return {
    renders: () => [
      deterministicRender('default open popover', () => (
        <Popover defaultOpen>
          <PopoverTrigger>Open popover</PopoverTrigger>
          <PopoverContent>Popover body</PopoverContent>
        </Popover>
      )),
    ],
  };
}
