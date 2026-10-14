import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { ProgressCircle, ProgressCircleIndicator } from '../../src/components';
describe('ProgressCircle benches', () => {
  bench(
    'SSR render progress circle',
    () => {
      renderToStringSync(() => (
        <ProgressCircle
          {...{
            value: 42,
            children: <ProgressCircleIndicator {...{}} />,
          }}
        />
      ));
    },
    { throws: true }
  );
});
