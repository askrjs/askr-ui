import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { Form } from '../../src/components/form';
describe('Form benches', () => {
  bench(
    'SSR render native form',
    () => {
      renderToStringSync(() => (
        <Form
          {...{
            method: 'post',
            children: <button type="submit">Save</button>,
          }}
        />
      ));
    },
    { throws: true }
  );
  bench(
    'SSR render form with asChild host',
    () => {
      renderToStringSync(() => (
        <Form
          {...{
            asChild: true,
            children: <section>Fields</section>,
          }}
        />
      ));
    },
    { throws: true }
  );
});
