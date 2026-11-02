import { renderToStringSync } from '@askrjs/askr/ssr';
import { describe } from 'vite-plus/test';
import { registerBench } from '../bench';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from '../../src/components';
describe('Menubar benches', () => {
  registerBench(
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
