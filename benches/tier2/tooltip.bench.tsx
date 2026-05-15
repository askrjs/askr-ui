import { bench, describe } from 'vite-plus/test';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../../src/components/tooltip';

describe('Tooltip benches - default tree', () => {
  bench('create tooltip tree', () => {
    Tooltip({
      defaultOpen: true,
      children: (
        <>
          <TooltipTrigger>Help</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent>Body</TooltipContent>
          </TooltipPortal>
        </>
      ),
    });
  });
});

describe('Tooltip benches - asChild content', () => {
  bench('create tooltip tree with asChild content', () => {
    Tooltip({
      defaultOpen: true,
      children: (
        <>
          <TooltipTrigger>Help</TooltipTrigger>
          <TooltipPortal>
            <TooltipContent asChild>
              <section>Body</section>
            </TooltipContent>
          </TooltipPortal>
        </>
      ),
    });
  });
});
