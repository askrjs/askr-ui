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
import { expectNoAxeViolations } from '../../accessibility';

describe('Disclosure components - Accessibility', () => {
  it('has no disclosure accessibility regressions', async () => {
    await expectNoAxeViolations(
      <div>
        <Accordion defaultValue="one">
          <AccordionItem value="one">
            <AccordionHeader>
              <AccordionTrigger>One</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>First</AccordionContent>
          </AccordionItem>
        </Accordion>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">Overview panel</TabsContent>
          <TabsContent value="settings">Settings panel</TabsContent>
        </Tabs>
        <ToggleGroup defaultValue="left">
          <ToggleGroupItem value="left">Left</ToggleGroupItem>
          <ToggleGroupItem value="right">Right</ToggleGroupItem>
        </ToggleGroup>
      </div>
    );
  });
});
