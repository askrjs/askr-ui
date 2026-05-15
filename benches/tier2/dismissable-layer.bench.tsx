import { bench, describe } from 'vite-plus/test';
import { DismissableLayer } from '../../src/components/dismissable-layer';

describe('DismissableLayer benches', () => {
  bench('create dismissable layer', () => {
    DismissableLayer({
      children: <div>Layer</div>,
    });
  });

  bench('create disabled dismissable layer', () => {
    DismissableLayer({
      disabled: true,
      children: <div>Layer</div>,
    });
  });

  bench('create dismissable layer with outside pointer guard', () => {
    DismissableLayer({
      disableOutsidePointerEvents: true,
      children: <div>Layer</div>,
    });
  });
});
