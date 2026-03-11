import { bench, describe } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '../../src/components/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../src/components/tabs';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../src/components/toggle-group';

describe('Disclosure benches', () => {
  bench('create accordion', () => {
    Accordion({
      defaultValue: 'one',
      children: [
        AccordionItem({
          value: 'one',
          children: [
            AccordionHeader({
              children: [AccordionTrigger({ children: 'One' })],
            }),
            AccordionContent({ children: 'First' }),
          ],
        }),
      ],
    });
  });

  bench('create tabs', () => {
    Tabs({
      defaultValue: 'overview',
      children: [
        TabsList({
          children: [TabsTrigger({ value: 'overview', children: 'Overview' })],
        }),
        TabsContent({ value: 'overview', children: 'Panel' }),
      ],
    });
  });

  bench('create toggle group', () => {
    ToggleGroup({
      defaultValue: 'left',
      children: [ToggleGroupItem({ value: 'left', children: 'Left' })],
    });
  });
});
