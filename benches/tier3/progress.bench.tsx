import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import { Progress, ProgressIndicator } from '../../src/components';
describe('Progress benches', () => {
  registerBench(
    'SSR render progress',
    () => {
      renderToStringSync(() => (
        <Progress
          {...{
            value: 42,
            children: <ProgressIndicator {...{}} />,
          }}
        />
      ));
    },
    { throws: true }
  );
});
