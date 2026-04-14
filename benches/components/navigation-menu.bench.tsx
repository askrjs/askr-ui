import { bench, describe } from 'vite-plus/test';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../../src/components';

describe('NavigationMenu benches', () => {
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
});
