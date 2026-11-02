import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '../../src/components';
describe('Accordion benches', () => {
  registerBench(
    'SSR render accordion',
    () => {
      renderToStringSync(() => (
        <Accordion
          {...{
            defaultValue: 'one',
            children: [
              <AccordionItem
                {...{
                  value: 'one',
                  children: [
                    <AccordionHeader
                      {...{
                        children: [
                          <AccordionTrigger {...{ children: 'One' }} />,
                        ],
                      }}
                    />,
                    <AccordionContent {...{ children: 'First' }} />,
                  ],
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
