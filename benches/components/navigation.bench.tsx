import { bench, describe } from 'vitest';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from '../../src/components/menubar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../../src/components/navigation-menu';
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '../../src/components/slider';
import {
  Toast,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '../../src/components/toast';

describe('Navigation benches', () => {
  bench('create toast stack', () => {
    ToastProvider({
      children: [
        ToastViewport({}),
        Toast({
          defaultOpen: true,
          children: [ToastTitle({ children: 'Saved' })],
        }),
      ],
    });
  });

  bench('create menubar', () => {
    Menubar({
      children: [
        MenubarMenu({
          value: 'file',
          children: [
            MenubarTrigger({ children: 'File' }),
            MenubarPortal({
              children: [
                MenubarContent({
                  children: [MenubarItem({ children: 'New' })],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  bench('create navigation menu', () => {
    NavigationMenu({
      children: [
        NavigationMenuList({
          children: [
            NavigationMenuItem({
              value: 'products',
              children: [
                NavigationMenuTrigger({ children: 'Products' }),
                NavigationMenuContent({
                  children: [
                    NavigationMenuLink({
                      href: '/products/core',
                      children: 'Core',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    });
  });

  bench('create slider', () => {
    Slider({
      defaultValue: 20,
      children: [
        SliderTrack({
          children: [SliderRange({}), SliderThumb({})],
        }),
      ],
    });
  });
});
