import { bench, describe } from 'vite-plus/test';
import { DismissableLayer, FocusScope } from '../../src/components';
import { FocusRing } from '../../src/components/composites/focus-ring';

describe('Focus foundation benches', () => {
  bench('create FocusRing', () => {
    FocusRing({
      children: <button type="button">Focusable</button>,
    });
  });

  bench('create FocusScope', () => {
    FocusScope({
      loop: true,
      children: [
        <button type="button">First</button>,
        <button type="button">Second</button>,
      ],
    });
  });

  bench('create DismissableLayer', () => {
    DismissableLayer({
      children: <div>Layer</div>,
    });
  });
});
