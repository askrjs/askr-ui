import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '../../../../../src/components/accordion';
import { mount } from '../../_mount';

export function axeOpenItem(root: HTMLElement): void {
  mount(
    <Accordion defaultValue="one">
      <AccordionItem value="one">
        <AccordionHeader>
          <AccordionTrigger>One</AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>First</AccordionContent>
      </AccordionItem>
    </Accordion>,
    root
  );
}
