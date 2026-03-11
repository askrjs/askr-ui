import { describe, it } from 'vitest';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from '../../../src/components/menubar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '../../../src/components/navigation-menu';
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '../../../src/components/slider';
import { expectNoAxeViolations } from '../../accessibility';

describe('Navigation components - Accessibility', () => {
  it('has no navigation accessibility regressions', async () => {
    await expectNoAxeViolations(
      <div>
        <Menubar>
          <MenubarMenu value="file">
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarPortal>
              <MenubarContent>
                <MenubarItem>New</MenubarItem>
              </MenubarContent>
            </MenubarPortal>
          </MenubarMenu>
        </Menubar>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem value="products">
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink href="/products/core">
                  Core
                </NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>
        <Slider defaultValue={20}>
          <SliderTrack>
            <SliderRange />
            <SliderThumb aria-label="Volume" />
          </SliderTrack>
        </Slider>
      </div>
    );
  });
});
