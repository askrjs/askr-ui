import { bench, describe } from 'vite-plus/test';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../src/components/hover-card';

describe('HoverCard benches - default tree', () => {
  bench('create hover card tree', () => {
    HoverCard({
      defaultOpen: true,
      children: [
        HoverCardTrigger({ children: 'Preview' }),
        HoverCardContent({ children: 'Details' }),
      ],
    });
  });
});

describe('HoverCard benches - asChild parts', () => {
  bench('create hover card tree with asChild parts', () => {
    HoverCard({
      defaultOpen: true,
      children: [
        HoverCardTrigger({
          asChild: true,
          children: <button type="button">Preview</button>,
        }),
        HoverCardContent({
          asChild: true,
          children: <section>Details</section>,
        }),
      ],
    });
  });
});
