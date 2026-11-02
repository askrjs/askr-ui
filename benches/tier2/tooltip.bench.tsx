import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../../src/components/tooltip';
describe('Tooltip benches - default tree', () => {
  registerBench(
    'SSR render tooltip tree',
    () => {
      renderToStringSync(() => (
        <Tooltip
          {...{
            defaultOpen: true,
            children: (
              <>
                <TooltipTrigger>Help</TooltipTrigger>
                <TooltipPortal>
                  <TooltipContent>Body</TooltipContent>
                </TooltipPortal>
              </>
            ),
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('Tooltip benches - asChild content', () => {
  registerBench(
    'SSR render tooltip tree with asChild content',
    () => {
      renderToStringSync(() => (
        <Tooltip
          {...{
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
          }}
        />
      ));
    },
    { throws: true }
  );
});
