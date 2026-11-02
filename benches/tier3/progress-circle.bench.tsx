import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import { ProgressCircle, ProgressCircleIndicator } from '../../src/components';
describe('ProgressCircle benches', () => {
  registerBench(
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
