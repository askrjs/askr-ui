import { For, state } from '@askrjs/askr';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '../../../../src/components/accordion';
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from '../../../../src/components/dropdown';
import { Menu, MenuContent, MenuItem } from '../../../../src/components/menu';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarPortal,
  MenubarTrigger,
} from '../../../../src/components/menubar';
import {
  RadioGroup,
  RadioGroupItem,
} from '../../../../src/components/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../src/components/select';
import {
  Slider,
  SliderRange,
  SliderThumb,
  SliderTrack,
} from '../../../../src/components/slider';
import { flushUpdates, mount, unmount } from '../../test-utils';

const ITEMS = [
  { value: 'one', label: 'One' },
  { value: 'two', label: 'Two' },
] as const;

type DynamicMode = 'map' | 'for';

function DynamicItems<T>(props: {
  mode: DynamicMode;
  each: readonly T[];
  by: (item: T, index: number) => string | number;
  children: (item: T) => JSX.Element;
}) {
  return props.mode === 'map' ? (
    props.each.map(props.children)
  ) : (
    <For each={props.each} by={props.by}>
      {props.children}
    </For>
  );
}

function modes() {
  return ['map', 'for'] as const;
}

describe('dynamic children context contract', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    unmount(container);
    container = undefined;
  });

  it('should support mapped and For-rendered Accordion items', async () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <Accordion key={mode} defaultValue="one">
            <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
              {(item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionHeader>
                    <AccordionTrigger>
                      {item.label} {mode}
                    </AccordionTrigger>
                  </AccordionHeader>
                  <AccordionContent>{item.label} content</AccordionContent>
                </AccordionItem>
              )}
            </DynamicItems>
          </Accordion>
        ))}
      </div>
    );

    for (const mode of modes()) {
      const trigger = Array.from(container.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === `Two ${mode}`
      );
      trigger?.click();
    }
    await flushUpdates();

    for (const mode of modes()) {
      const trigger = Array.from(container.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === `Two ${mode}`
      );
      expect(trigger?.getAttribute('aria-expanded')).toBe('true');
    }
  });

  it('should support mapped and For-rendered RadioGroup items', async () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <RadioGroup key={mode} defaultValue="one">
            <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
              {(item) => (
                <RadioGroupItem key={item.value} value={item.value}>
                  {item.label} {mode}
                </RadioGroupItem>
              )}
            </DynamicItems>
          </RadioGroup>
        ))}
      </div>
    );

    for (const mode of modes()) {
      const item = Array.from(
        container.querySelectorAll('[role="radio"]')
      ).find((radio) => radio.textContent?.trim() === `Two ${mode}`);
      (item as HTMLElement | undefined)?.click();
    }
    await flushUpdates();

    for (const mode of modes()) {
      const item = Array.from(
        container.querySelectorAll('[role="radio"]')
      ).find((radio) => radio.textContent?.trim() === `Two ${mode}`);
      expect(item?.getAttribute('aria-checked')).toBe('true');
    }
  });

  it('should support mapped and For-rendered Menu items', () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <Menu key={mode}>
            <MenuContent>
              <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
                {(item) => (
                  <MenuItem key={item.value}>
                    {item.label} {mode}
                  </MenuItem>
                )}
              </DynamicItems>
            </MenuContent>
          </Menu>
        ))}
      </div>
    );

    for (const mode of modes()) {
      const items = Array.from(
        container.querySelectorAll('[role="menuitem"]')
      ).filter((item) => item.textContent?.endsWith(mode));
      expect(items).toHaveLength(2);
      expect(items.map((item) => item.getAttribute('tabindex'))).toEqual([
        '0',
        '-1',
      ]);
    }
  });

  it('should support mapped and For-rendered Dropdown items', async () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <Dropdown key={mode} defaultOpen>
            <DropdownTrigger>Open {mode}</DropdownTrigger>
            <DropdownContent forceMount>
              <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
                {(item) => (
                  <DropdownItem key={item.value}>
                    {item.label} {mode}
                  </DropdownItem>
                )}
              </DynamicItems>
            </DropdownContent>
          </Dropdown>
        ))}
      </div>
    );
    await flushUpdates();

    for (const mode of modes()) {
      const items = Array.from(
        container.querySelectorAll('[role="menuitem"]')
      ).filter((item) => item.textContent?.endsWith(mode));
      expect(items).toHaveLength(2);
      expect(items.map((item) => item.getAttribute('tabindex'))).toEqual([
        '0',
        '-1',
      ]);
    }
  });

  it('should support mapped and For-rendered Select items', async () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <Select key={mode} defaultValue="one" name={mode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent forceMount>
              <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
                {(item) => (
                  <SelectItem
                    key={item.value}
                    value={item.value}
                    textValue={`${item.label} ${mode}`}
                  >
                    {item.label} {mode}
                  </SelectItem>
                )}
              </DynamicItems>
            </SelectContent>
          </Select>
        ))}
      </div>
    );

    for (const mode of modes()) {
      const item = Array.from(
        container.querySelectorAll('[role="option"]')
      ).find((option) => option.textContent?.trim() === `Two ${mode}`);
      (item as HTMLElement | undefined)?.click();
    }
    await flushUpdates();

    for (const mode of modes()) {
      const input = container.querySelector(
        `input[name="${mode}"]`
      ) as HTMLInputElement;
      expect(input.value).toBe('two');
    }
  });

  it('should support mapped and For-rendered Menubar menus and items', async () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <Menubar key={mode}>
            <DynamicItems mode={mode} each={ITEMS} by={(item) => item.value}>
              {(menu) => (
                <MenubarMenu key={menu.value} value={menu.value}>
                  <MenubarTrigger>
                    {menu.label} {mode}
                  </MenubarTrigger>
                  <MenubarPortal>
                    <MenubarContent forceMount>
                      <DynamicItems
                        mode={mode}
                        each={ITEMS}
                        by={(item) => item.value}
                      >
                        {(item) => (
                          <MenubarItem key={item.value}>
                            {menu.label} {item.label} action {mode}
                          </MenubarItem>
                        )}
                      </DynamicItems>
                    </MenubarContent>
                  </MenubarPortal>
                </MenubarMenu>
              )}
            </DynamicItems>
          </Menubar>
        ))}
      </div>
    );

    for (const mode of modes()) {
      const trigger = Array.from(container.querySelectorAll('button')).find(
        (button) => button.textContent?.trim() === `Two ${mode}`
      );
      trigger?.click();
    }
    await flushUpdates();
    await flushUpdates();
    await flushUpdates();

    for (const mode of modes()) {
      const triggers = Array.from(
        container.querySelectorAll('[role="menuitem"]')
      ).filter(
        (item) =>
          item.textContent?.endsWith(mode) &&
          !item.textContent.includes('action')
      );
      const actions = Array.from(
        document.body.querySelectorAll('[role="menuitem"]')
      ).filter(
        (item) =>
          item.textContent?.startsWith('Two ') &&
          item.textContent.endsWith(`action ${mode}`)
      );
      expect(triggers).toHaveLength(2);
      expect(actions).toHaveLength(2);
      expect(
        document.body.textContent?.includes(`One One action ${mode}`)
      ).toBe(false);
    }
  });

  it('should preserve mapped and For-rendered Accordion identity across reorder and clear/refill', async () => {
    const baseItems = [
      { value: 'alpha', label: 'Alpha' },
      { value: 'beta', label: 'Beta' },
    ] as const;

    for (const mode of modes()) {
      let setItems:
        | ((next: Array<(typeof baseItems)[number]>) => void)
        | undefined;

      function DynamicAccordion() {
        const items = state(baseItems);
        setItems = items.set;

        return (
          <Accordion type="multiple" key={mode} defaultValue={[]}>
            <DynamicItems mode={mode} each={items()} by={(item) => item.value}>
              {(item) => (
                <AccordionItem key={item.value} value={item.value}>
                  <AccordionHeader>
                    <AccordionTrigger>
                      {item.label} {mode}
                    </AccordionTrigger>
                  </AccordionHeader>
                  <AccordionContent>
                    {item.label} content {mode}
                  </AccordionContent>
                </AccordionItem>
              )}
            </DynamicItems>
          </Accordion>
        );
      }

      if (container) {
        unmount(container);
      }

      container = mount(<DynamicAccordion />);
      await flushUpdates();

      const getTrigger = (label: string) =>
        Array.from(container.querySelectorAll('button')).find(
          (button) => button.textContent?.trim() === `${label} ${mode}`
        ) as HTMLButtonElement;

      const betaTrigger = getTrigger('Beta');
      const betaControls = betaTrigger?.getAttribute('aria-controls');
      const alphaControls = getTrigger('Alpha')?.getAttribute('aria-controls');

      expect(betaControls).toBeTruthy();
      expect(alphaControls).toBeTruthy();
      expect(betaControls).not.toBe(alphaControls);
      betaTrigger.click();
      await flushUpdates();

      expect(container.textContent).toContain(`Beta content ${mode}`);

      setItems?.([
        { value: 'beta', label: 'Beta' },
        { value: 'alpha', label: 'Alpha' },
        { value: 'gamma', label: 'Gamma' },
      ]);
      await flushUpdates();

      expect(getTrigger('Alpha').getAttribute('aria-controls')).toBe(
        alphaControls
      );
      expect(getTrigger('Beta').getAttribute('aria-controls')).toBe(
        betaControls
      );
      expect(
        Array.from(container.querySelectorAll('[id]')).filter(
          (node) => node.id === betaControls
        )
      ).toHaveLength(1);
      expect(container.textContent).toContain(`Beta content ${mode}`);

      setItems?.([]);
      await flushUpdates();

      expect(container.textContent).not.toContain('Beta content');
      expect(container.textContent).not.toContain('Gamma content');

      setItems?.([baseItems[0]!, baseItems[1]!]);
      await flushUpdates();

      expect(getTrigger('Alpha').getAttribute('aria-controls')).toBe(
        alphaControls
      );
      expect(getTrigger('Beta').getAttribute('aria-controls')).toBe(
        betaControls
      );
      expect(container.textContent).toContain(`Beta content ${mode}`);
    }
  });

  it('should preserve static siblings while mapped and For-rendered Dropdown items re-shuffle', async () => {
    const initialItems = [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' },
      { value: 'three', label: 'Three' },
    ];

    for (const mode of modes()) {
      let setItems:
        | ((next: Array<(typeof initialItems)[number]>) => void)
        | undefined;

      function DynamicDropdown() {
        const items = state(initialItems);
        setItems = items.set;

        return (
          <div>
            <div data-testid="prefix">prefix</div>
            <Dropdown defaultOpen>
              <DropdownTrigger>Open {mode}</DropdownTrigger>
              <DropdownContent forceMount>
                <DynamicItems
                  mode={mode}
                  each={items()}
                  by={(item) => item.value}
                >
                  {(item) => (
                    <DropdownItem key={item.value}>
                      {item.label} {mode}
                    </DropdownItem>
                  )}
                </DynamicItems>
              </DropdownContent>
            </Dropdown>
            <div data-testid="suffix">suffix</div>
          </div>
        );
      }

      if (container) {
        unmount(container);
      }

      container = mount(<DynamicDropdown />);
      await flushUpdates();

      const trigger = container.querySelector('button') as HTMLButtonElement;
      expect(trigger).not.toBeNull();

      const before = container.querySelector('[data-testid="prefix"]');
      const after = container.querySelector('[data-testid="suffix"]');
      expect(before?.textContent).toBe('prefix');
      expect(after?.textContent).toBe('suffix');

      const item = (label: string) =>
        Array.from(document.body.querySelectorAll('[role="menuitem"]')).find(
          (node) => node.textContent?.trim() === `${label} ${mode}`
        ) as HTMLDivElement;

      expect(item('Three')).not.toBeUndefined();

      setItems?.([
        { value: 'three', label: 'Three' },
        { value: 'two', label: 'Two' },
        { value: 'one', label: 'One' },
      ]);
      await flushUpdates();
      await flushUpdates();

      expect(
        Array.from(document.body.querySelectorAll('[role="menuitem"]')).map(
          (node) => node.textContent?.trim()
        )
      ).toEqual([`Three ${mode}`, `Two ${mode}`, `One ${mode}`]);

      setItems?.([{ value: 'two', label: 'Two' }]);
      await flushUpdates();
      await flushUpdates();

      expect(
        Array.from(document.body.querySelectorAll('[role="menuitem"]')).map(
          (node) => node.textContent?.trim()
        )
      ).toEqual([`Two ${mode}`]);

      setItems?.(initialItems);
      await flushUpdates();
      await flushUpdates();

      expect(
        Array.from(document.body.querySelectorAll('[role="menuitem"]')).map(
          (node) => node.textContent?.trim()
        )
      ).toEqual([`One ${mode}`, `Two ${mode}`, `Three ${mode}`]);
      expect(before?.textContent).toBe('prefix');
      expect(after?.textContent).toBe('suffix');
    }
  });

  it('should keep dynamic Menubar identities stable across reorder and removal', async () => {
    const initialMenus = [
      { value: 'alpha', label: 'Alpha' },
      { value: 'beta', label: 'Beta' },
    ];
    let setMenus:
      | ((next: Array<{ value: string; label: string }>) => void)
      | undefined;

    function DynamicMenubar() {
      const menus = state(initialMenus);
      setMenus = menus.set;

      return (
        <Menubar id="dynamic-menubar">
          {menus().map((menu) => (
            <MenubarMenu key={menu.value} value={menu.value}>
              <MenubarTrigger>{menu.label}</MenubarTrigger>
              <MenubarPortal>
                <MenubarContent>
                  <MenubarItem>{menu.label} action</MenubarItem>
                </MenubarContent>
              </MenubarPortal>
            </MenubarMenu>
          ))}
        </Menubar>
      );
    }

    container = mount(<DynamicMenubar />);
    await flushUpdates();

    const getTrigger = (label: string) =>
      Array.from(container?.querySelectorAll('button') ?? []).find(
        (button) => button.textContent?.trim() === label
      ) as HTMLButtonElement;
    const initialControls = {
      alpha: getTrigger('Alpha').getAttribute('aria-controls'),
      beta: getTrigger('Beta').getAttribute('aria-controls'),
    };

    expect(initialControls.alpha).not.toBe(initialControls.beta);
    expect(initialControls.alpha).toBeTruthy();
    expect(initialControls.beta).toBeTruthy();

    const betaControls = initialControls.beta!;
    const alphaControls = initialControls.alpha!;
    const getMenuContentNodes = (contentId: string) =>
      Array.from(document.body.querySelectorAll('[role="menu"]')).filter(
        (node) => node.id === contentId
      );

    const betaTrigger = getTrigger('Beta');
    betaTrigger.click();
    await flushUpdates();
    await flushUpdates();
    await flushUpdates();

    expect(document.body.textContent).not.toContain('Alpha action');
    expect(getMenuContentNodes(betaControls).length).toBe(1);

    setMenus?.([initialMenus[1]!, initialMenus[0]!]);
    await flushUpdates();
    await flushUpdates();
    await flushUpdates();

    expect(document.body.textContent).not.toContain('Alpha action');

    const betaAfterReorder = getTrigger('Beta');
    const alphaAfterReorder = getTrigger('Alpha');
    expect(alphaAfterReorder.getAttribute('aria-controls')).toBe(alphaControls);
    expect(betaAfterReorder.getAttribute('aria-controls')).toBe(betaControls);

    setMenus?.([initialMenus[0]!]);
    await flushUpdates();
    await flushUpdates();
    await flushUpdates();

    const alphaAfterRemoval = getTrigger('Alpha');
    expect(alphaAfterRemoval.getAttribute('aria-controls')).toBe(alphaControls);
    expect(document.body.textContent).not.toContain('Alpha action');
    expect(document.body.textContent).not.toContain('Beta action');
    expect(getMenuContentNodes(betaControls).length).toBe(0);

    setMenus?.(initialMenus);
    await flushUpdates();
    await flushUpdates();
    await flushUpdates();

    const betaRestored = getTrigger('Beta');
    const alphaRestored = getTrigger('Alpha');
    expect(alphaRestored.getAttribute('aria-controls')).toBe(alphaControls);
    expect(betaRestored.getAttribute('aria-controls')).toBe(betaControls);
  });

  it('should reject duplicate dynamic Menubar values', () => {
    expect(() => {
      container = mount(
        <Menubar>
          {['First', 'Second'].map((label) => (
            <MenubarMenu key={label} value="duplicate">
              <MenubarTrigger>{label}</MenubarTrigger>
            </MenubarMenu>
          ))}
        </Menubar>
      );
    }).toThrow(/MenubarMenu values must be unique/);
  });

  it('should support mapped and For-rendered Slider parts', () => {
    container = mount(
      <div>
        {modes().map((mode) => (
          <Slider key={mode} defaultValue={25}>
            <DynamicItems mode={mode} each={['track']} by={(part) => part}>
              {() => (
                <SliderTrack key="track">
                  <SliderRange />
                  <SliderThumb aria-label={`${mode} value`} />
                </SliderTrack>
              )}
            </DynamicItems>
          </Slider>
        ))}
      </div>
    );

    for (const mode of modes()) {
      const thumb = container.querySelector(`[aria-label="${mode} value"]`);
      expect(thumb?.getAttribute('aria-valuenow')).toBe('25');
    }
  });
});
