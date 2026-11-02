import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import { Avatar, AvatarFallback, AvatarImage } from '../../src/components';
describe('Avatar benches', () => {
  registerBench(
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
