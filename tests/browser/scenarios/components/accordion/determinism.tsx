import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '../../../../../src/components/accordion';
import { type DeterministicRender, deterministicRender } from '../../_mount';

export function accordionMarkup(): {
  renders: () => DeterministicRender[];
} {
  return {
    renders: () => [
      deterministicRender('accordion with default open item', () => (
        <Accordion defaultValue="one">
          <AccordionItem value="one">
            <AccordionHeader>
              <AccordionTrigger>One</AccordionTrigger>
            </AccordionHeader>
            <AccordionContent>First</AccordionContent>
          </AccordionItem>
        </Accordion>
      )),
    ],
  };
}
