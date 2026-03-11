import { describe, it } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '../../../src/components/accordion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../src/components/tabs';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '../../../src/components/toggle-group';
import { expectDeterministicRender } from '../../determinism';

describe('Disclosure components - Determinism', () => {
  it('renders deterministic disclosure markup', () => {
    expectDeterministicRender(() => (
      <Accordion defaultValue="one">
        <AccordionItem value="one">
          <AccordionHeader>
            <AccordionTrigger>One</AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>First</AccordionContent>
        </AccordionItem>
      </Accordion>
    ));
    expectDeterministicRender(() => (
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">Overview panel</TabsContent>
      </Tabs>
    ));
    expectDeterministicRender(() => (
      <ToggleGroup defaultValue="left">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
      </ToggleGroup>
    ));
  });
});
