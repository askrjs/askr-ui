import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../../../../../src/components/tooltip';
import { mount } from '../../_mount';

export function axeOpenTooltip(root: HTMLElement): void {
  mount(
    <Tooltip defaultOpen>
      <TooltipTrigger>Help</TooltipTrigger>
      <TooltipPortal>
        <TooltipContent>Helpful text</TooltipContent>
      </TooltipPortal>
    </Tooltip>,
    root
  );
}
