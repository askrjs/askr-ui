import { renderToStringSync } from '@askrjs/askr/ssr';
import { bench, describe } from 'vite-plus/test';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from '../../src/components';
describe('Menubar benches', () => {
  bench(
    'SSR render menubar',
    () => {
      renderToStringSync(() => (
        <Menubar
          {...{
            children: [
              <MenubarMenu
                {...{
                  value: 'file',
                  children: [
                    <MenubarTrigger {...{ children: 'File' }} />,
                    <MenubarPortal
                      {...{
                        children: [
                          <MenubarContent
                            {...{
                              children: [
                                <MenubarItem {...{ children: 'New' }} />,
                              ],
                            }}
                          />,
                        ],
                      }}
                    />,
                  ],
                }}
              />,
            ],
          }}
        />
      ));
    },
    { throws: true }
  );
});
