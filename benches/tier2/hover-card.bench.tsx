import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../src/components/hover-card';
describe('HoverCard benches - default tree', () => {
  registerBench(
    'SSR render hover card tree',
    () => {
      renderToStringSync(() => (
        <HoverCard
          {...{
            defaultOpen: true,
            children: [
              <HoverCardTrigger {...{ children: 'Preview' }} />,
              <HoverCardContent {...{ children: 'Details' }} />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('HoverCard benches - asChild parts', () => {
  registerBench(
    'SSR render hover card tree with asChild parts',
    () => {
      renderToStringSync(() => (
        <HoverCard
          {...{
            defaultOpen: true,
            children: [
              <HoverCardTrigger
                {...{
                  asChild: true,
                  children: <button type="button">Preview</button>,
                }}
              />,
              <HoverCardContent
                {...{
                  asChild: true,
                  children: <section>Details</section>,
                }}
              />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
