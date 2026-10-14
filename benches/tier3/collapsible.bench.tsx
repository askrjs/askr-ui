import {
  runBrowserBench,
  flushBrowserBenchUpdates,
} from '../tier4/browser-bench';
import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '../../src/components';
describe('Collapsible benches - closed', () => {
  bench(
    'SSR render closed collapsible',
    () => {
      renderToStringSync(() => (
        <Collapsible
          {...{
            children: [
              <CollapsibleTrigger {...{ children: 'Toggle' }} />,
              <CollapsibleContent {...{ children: 'Content' }} />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('Collapsible benches - open', () => {
  bench(
    'SSR render open collapsible',
    () => {
      renderToStringSync(() => (
        <Collapsible
          {...{
            defaultOpen: true,
            children: [
              <CollapsibleTrigger {...{ children: 'Toggle' }} />,
              <CollapsibleContent {...{ children: 'Content' }} />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('Collapsible benches - disabled', () => {
  bench(
    'SSR render disabled collapsible',
    () => {
      renderToStringSync(() => (
        <Collapsible
          {...{
            disabled: true,
            children: [
              <CollapsibleTrigger {...{ children: 'Toggle' }} />,
              <CollapsibleContent {...{ children: 'Content' }} />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('Collapsible benches - forceMount', () => {
  bench(
    'SSR render with forceMount',
    () => {
      renderToStringSync(() => (
        <Collapsible
          {...{
            defaultOpen: false,
            children: [
              <CollapsibleTrigger {...{ children: 'Toggle' }} />,
              <CollapsibleContent
                {...{ forceMount: true, children: 'Content' }}
              />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
describe('Collapsible benches - state toggle', () => {
  bench(
    'mount, toggle open/closed/open, and clean up',
    async () => {
      await runBrowserBench(
        <Collapsible>
          <CollapsibleTrigger>Toggle</CollapsibleTrigger>
          <CollapsibleContent>Content</CollapsibleContent>
        </Collapsible>,
        async (container) => {
          const trigger = container.querySelector<HTMLElement>(
            '[data-slot="collapsible-trigger"]'
          );
          if (!trigger) throw new Error('Missing mounted collapsible trigger');
          for (const expected of ['open', 'closed', 'open']) {
            trigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            await flushBrowserBenchUpdates();
            if (trigger.dataset.state !== expected)
              throw new Error(`Expected collapsible state ${expected}`);
          }
        }
      );
    },
    { throws: true }
  );
});
