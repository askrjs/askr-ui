import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../../../../../src/components/tooltip';
import { deterministicRender } from '../../_mount';

export function tooltipMarkup() {
  return {
    renders: () => [
      deterministicRender('default open tooltip', () => (
        <Tooltip defaultOpen>
          <TooltipTrigger>Help</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>Helpful text</TooltipContent>
          </TooltipPortal>
        </Tooltip>
      )),
    ],
  };
}
