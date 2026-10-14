import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { DismissableLayer } from '../../src/components/dismissable-layer';
describe('DismissableLayer benches', () => {
  bench(
    'SSR render dismissable layer',
    () => {
      renderToStringSync(() => (
        <DismissableLayer
          {...{
            children: <div>Layer</div>,
          }}
        />
      ));
    },
    { throws: true }
  );
  bench(
    'SSR render disabled dismissable layer',
    () => {
      renderToStringSync(() => (
        <DismissableLayer
          {...{
            disabled: true,
            children: <div>Layer</div>,
          }}
        />
      ));
    },
    { throws: true }
  );
  bench(
    'SSR render dismissable layer with outside pointer guard',
    () => {
      renderToStringSync(() => (
        <DismissableLayer
          {...{
            disableOutsidePointerEvents: true,
            children: <div>Layer</div>,
          }}
        />
      ));
    },
    { throws: true }
  );
});
