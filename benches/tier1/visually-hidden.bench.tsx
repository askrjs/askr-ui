import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import { VisuallyHidden } from '../../src/components/visually-hidden';
describe('VisuallyHidden benches', () => {
  registerBench(
    'SSR render hidden span',
    () => {
      renderToStringSync(() => (
        <VisuallyHidden {...{ children: 'Hidden text' }} />
      ));
    },
    { throws: true }
  );
  registerBench(
    'SSR render hidden asChild host',
    () => {
      renderToStringSync(() => (
        <VisuallyHidden
          {...{
            asChild: true,
            children: <strong>Hidden text</strong>,
          }}
        />
      ));
    },
    { throws: true }
  );
});
