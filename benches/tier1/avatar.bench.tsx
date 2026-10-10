import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components';
describe('Avatar benches', () => {
  bench(
    'SSR render avatar',
    () => {
      renderToStringSync(() => (
        <Avatar
          {...{
            children: [
              <AvatarImage {...{ src: '/avatar.png', alt: 'Jane Doe' }} />,
              <AvatarFallback {...{ children: 'JD' }} />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
