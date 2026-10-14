import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { VisuallyHidden } from '../../src/components/visually-hidden';
describe('VisuallyHidden benches', () => {
  bench(
    'SSR render hidden span',
    () => {
      renderToStringSync(() => (
        <VisuallyHidden {...{ children: 'Hidden text' }} />
      ));
    },
    { throws: true }
  );
  bench(
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
