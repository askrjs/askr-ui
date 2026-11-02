import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import { DismissableLayer } from '../../src/components/dismissable-layer';
describe('DismissableLayer benches', () => {
  registerBench(
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
  registerBench(
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
  registerBench(
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
