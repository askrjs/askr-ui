import { afterEach, describe, expect, it } from 'vitest';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../../../src/components/menubar';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuSub,
  NavigationMenuSubContent,
  NavigationMenuSubTrigger,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '../../../src/components/navigation-menu';
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '../../../src/components/slider';
import { flushUpdates, mount, unmount } from '../../test-utils';

function getButtonByText(text: string): HTMLButtonElement {
  const button = Array.from(document.body.querySelectorAll('button')).find(
    (element) => element.textContent?.trim() === text
  );

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(`Unable to find button with text "${text}"`);
  }

  return button;
}

async function flushPortalUpdates() {
  await flushUpdates();
  await flushUpdates();
  await flushUpdates();
}

describe('Navigation components - Behavior', () => {
  let container: HTMLElement;

  afterEach(() => {
    unmount(container);
  });

  it('switches menubar open state between top-level triggers and nested submenus', async () => {
    container = mount(
      <Menubar>
        <MenubarMenu value="file">
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>New</MenubarItem>
              <MenubarSub value="share">
                <MenubarSubTrigger>Share</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Email</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
        <MenubarMenu value="edit">
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarPortal>
            <MenubarContent>
              <MenubarItem>Cut</MenubarItem>
            </MenubarContent>
          </MenubarPortal>
        </MenubarMenu>
      </Menubar>
    );

    getButtonByText('File').click();
    await flushPortalUpdates();

    expect(document.body.textContent).toContain('New');

    getButtonByText('Edit').dispatchEvent(
      new PointerEvent('pointerenter', { bubbles: true })
    );
    await flushPortalUpdates();

    expect(document.body.textContent).toContain('Cut');

    getButtonByText('File').click();
    await flushPortalUpdates();

    getButtonByText('Share').dispatchEvent(
      new PointerEvent('pointerenter', { bubbles: true })
    );
    await flushPortalUpdates();

    expect(document.body.textContent).toContain('Email');
  });

  it('updates navigation menu viewport and indicator state with nested flyouts', async () => {
    container = mount(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem value="products">
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/products/core">
                Core
              </NavigationMenuLink>
              <NavigationMenuSub value="more">
                <NavigationMenuSubTrigger>More</NavigationMenuSubTrigger>
                <NavigationMenuSubContent>
                  <NavigationMenuLink href="/products/pro">
                    Pro
                  </NavigationMenuLink>
                </NavigationMenuSubContent>
              </NavigationMenuSub>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuViewport />
        <NavigationMenuIndicator />
      </NavigationMenu>
    );

    getButtonByText('Products').click();
    await flushPortalUpdates();

    expect(
      container
        .querySelector('[data-navigation-menu-viewport="true"]')
        ?.getAttribute('data-state')
    ).toBe('open');
    expect(
      container
        .querySelector('[data-navigation-menu-indicator="true"]')
        ?.getAttribute('data-active-item')
    ).toBe('products');

    getButtonByText('More').dispatchEvent(
      new PointerEvent('pointerenter', { bubbles: true })
    );
    await flushPortalUpdates();

    expect(document.body.textContent).toContain('Pro');
  });

  it('supports keyboard opening and escape dismissal for promoted navigation roots', async () => {
    container = mount(
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
        </NavigationMenu>
      </div>
    );

    const fileTrigger = getButtonByText('File');
    fileTrigger.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    await flushPortalUpdates();
    expect(document.body.textContent).toContain('New');

    (
      document.body.querySelector('[role="menu"]') as HTMLDivElement
    ).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await flushPortalUpdates();
    expect(document.body.textContent).not.toContain('New');

    const productsTrigger = getButtonByText('Products');
    productsTrigger.click();
    await flushPortalUpdates();
    expect(document.body.textContent).toContain('Core');

    (
      document.body.querySelector('[data-state="open"][data-side="bottom"]') as
        | HTMLDivElement
        | null
    )?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await flushPortalUpdates();
    expect(document.body.textContent).not.toContain('Core');
  });

  it('updates the slider value from pointer and keyboard input', async () => {
    container = mount(
      <Slider defaultValue={20} name="volume">
        <SliderTrack>
          <SliderRange />
          <SliderThumb />
        </SliderTrack>
      </Slider>
    );

    const track = container.querySelector(
      '[data-slider-track="true"]'
    ) as HTMLDivElement;
    track.getBoundingClientRect = () =>
      ({
        left: 0,
        top: 0,
        width: 100,
        height: 10,
        right: 100,
        bottom: 10,
        x: 0,
        y: 0,
        toJSON: () => null,
      }) as DOMRect;

    track.dispatchEvent(
      new PointerEvent('pointerdown', {
        bubbles: true,
        clientX: 80,
        clientY: 5,
      })
    );
    window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    await flushUpdates();

    const thumb = container.querySelector('[role="slider"]') as HTMLDivElement;
    const input = container.querySelector(
      'input[type="hidden"]'
    ) as HTMLInputElement;

    expect(thumb.getAttribute('aria-valuenow')).toBe('80');
    expect(input.value).toBe('80');

    thumb.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    await flushUpdates();
    expect(input.value).toBe('81');
  });
});
