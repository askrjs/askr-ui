import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { Progress, ProgressIndicator } from '../../src/components';
describe('Progress benches', () => {
  bench(
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
