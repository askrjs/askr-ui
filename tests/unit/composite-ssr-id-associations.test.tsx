import { describe, expect, it } from 'vite-plus/test';
import type { JSX } from '@askrjs/askr/jsx-runtime';
import { renderToStringSync } from '@askrjs/askr/ssr';
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from '../../src/components/dropdown';
import {
  Select,
  SelectContent,
  SelectTrigger,
} from '../../src/components/select';
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '../../src/components/menubar';

type FixtureProps = {
  contentId?: JSX.IntrinsicElements['div']['id'];
  triggerId?: JSX.IntrinsicElements['button']['id'];
  controls?: string | null;
  labelledBy?: string | null;
};

const fixtures = [
  {
    name: 'Dropdown',
    triggerSlot: 'dropdown-trigger',
    contentSlot: 'dropdown-content',
    render: (props: FixtureProps) => (
      <Dropdown defaultOpen>
        <DropdownTrigger id={props.triggerId} aria-controls={props.controls}>
          Open
        </DropdownTrigger>
        <DropdownContent id={props.contentId}>Body</DropdownContent>
      </Dropdown>
    ),
    labelled: false,
  },
  {
    name: 'Select',
    triggerSlot: 'select-trigger',
    contentSlot: 'select-content',
    render: (props: FixtureProps) => (
      <Select defaultOpen>
        <SelectTrigger id={props.triggerId} aria-controls={props.controls}>
          Open
        </SelectTrigger>
        <SelectContent id={props.contentId}>Body</SelectContent>
      </Select>
    ),
    labelled: false,
  },
  {
    name: 'Menubar menu',
    triggerSlot: 'menubar-trigger',
    contentSlot: 'menubar-content',
    render: (props: FixtureProps) => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger id={props.triggerId} aria-controls={props.controls}>
            Open
          </MenubarTrigger>
          <MenubarContent
            forceMount
            id={props.contentId}
            aria-labelledby={props.labelledBy}
          >
            Body
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ),
    labelled: true,
  },
  {
    name: 'Menubar submenu',
    triggerSlot: 'menubar-sub-trigger',
    contentSlot: 'menubar-content',
    render: (props: FixtureProps) => (
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Open</MenubarTrigger>
          <MenubarContent forceMount>
            <MenubarSub>
              <MenubarSubTrigger
                id={props.triggerId}
                aria-controls={props.controls}
              >
                Sub
              </MenubarSubTrigger>
              <MenubarSubContent
                forceMount
                id={props.contentId}
                aria-labelledby={props.labelledBy}
              >
                Body
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    ),
    labelled: true,
  },
];

function partTag(html: string, slot: string) {
  const tags = [
    ...html.matchAll(new RegExp(`<[^>]+\\bdata-slot="${slot}"[^>]*>`, 'g')),
  ];
  return tags.at(-1)?.[0] ?? '';
}

describe('Composite SSR actual part ID associations', () => {
  for (const fixture of fixtures) {
    it(`should associate ${fixture.name} trigger with the rendered forward content ID`, () => {
      const html = renderToStringSync(() =>
        fixture.render({ contentId: 'caller-content' })
      );
      expect(partTag(html, fixture.contentSlot)).toContain(
        'id="caller-content"'
      );
      expect(partTag(html, fixture.triggerSlot)).toContain(
        'aria-controls="caller-content"'
      );
    });

    if (fixture.labelled) {
      it(`should name ${fixture.name} content with the actual trigger ID`, () => {
        const html = renderToStringSync(() =>
          fixture.render({ triggerId: 'caller-trigger' })
        );
        expect(partTag(html, fixture.triggerSlot)).toContain(
          'id="caller-trigger"'
        );
        expect(partTag(html, fixture.contentSlot)).toContain(
          'aria-labelledby="caller-trigger"'
        );
      });
    }

    it(`should resolve ${fixture.name} reactive part IDs once`, () => {
      let triggerReads = 0;
      let contentReads = 0;
      const html = renderToStringSync(() =>
        fixture.render({
          triggerId: () => {
            triggerReads++;
            return 'reactive-trigger';
          },
          contentId: () => {
            contentReads++;
            return 'reactive-content';
          },
        })
      );
      expect(partTag(html, fixture.triggerSlot)).toContain(
        'aria-controls="reactive-content"'
      );
      if (fixture.labelled)
        expect(partTag(html, fixture.contentSlot)).toContain(
          'aria-labelledby="reactive-trigger"'
        );
      expect({ triggerReads, contentReads }).toEqual({
        triggerReads: 1,
        contentReads: 1,
      });
    });

    for (const explicit of ['caller-association', null]) {
      it(`should preserve ${fixture.name} explicit ${explicit === null ? 'null' : 'caller'} ARIA`, () => {
        const html = renderToStringSync(() =>
          fixture.render({
            triggerId: 'caller-trigger',
            contentId: 'caller-content',
            controls: explicit,
            labelledBy: explicit,
          })
        );
        const trigger = partTag(html, fixture.triggerSlot);
        const content = partTag(html, fixture.contentSlot);
        if (explicit === null) {
          expect(trigger).not.toContain('aria-controls');
          if (fixture.labelled)
            expect(content).not.toContain('aria-labelledby');
        } else {
          expect(trigger).toContain(`aria-controls="${explicit}"`);
          if (fixture.labelled)
            expect(content).toContain(`aria-labelledby="${explicit}"`);
        }
      });
    }
  }
});
