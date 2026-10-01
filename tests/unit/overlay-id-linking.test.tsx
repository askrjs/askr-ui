import { describe, expect, it } from 'vite-plus/test';
import { renderToStringSync } from '@askrjs/askr/ssr';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../src/components/popover';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../src/components/hover-card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../src/components/tooltip';

describe('Overlay server ID associations', () => {
  for (const family of ['popover', 'hover-card'] as const) {
    it.each([false, true])(
      `${family} should associate opaque custom parts, contentFirst=%s`,
      (contentFirst) => {
        const Root = family === 'popover' ? Popover : HoverCard;
        const Trigger =
          family === 'popover' ? PopoverTrigger : HoverCardTrigger;
        const Content =
          family === 'popover' ? PopoverContent : HoverCardContent;
        const TriggerPart = () => <Trigger id="custom-trigger">Open</Trigger>;
        const ContentPart = () => <Content id="custom-content">Body</Content>;
        const html = renderToStringSync(() => (
          <Root defaultOpen>
            {contentFirst ? (
              <>
                <ContentPart />
                <TriggerPart />
              </>
            ) : (
              <>
                <TriggerPart />
                <ContentPart />
              </>
            )}
          </Root>
        ));
        expect(html).toContain('aria-controls="custom-content"');
        expect(html).toContain('aria-labelledby="custom-trigger"');
      }
    );

    it(`${family} should preserve caller reference attributes`, () => {
      const Root = family === 'popover' ? Popover : HoverCard;
      const Trigger = family === 'popover' ? PopoverTrigger : HoverCardTrigger;
      const Content = family === 'popover' ? PopoverContent : HoverCardContent;
      const html = renderToStringSync(() => (
        <Root defaultOpen>
          <Trigger id="custom-trigger" aria-controls="caller-content">
            Open
          </Trigger>
          <Content id="custom-content" aria-labelledby="caller-title">
            Body
          </Content>
        </Root>
      ));
      expect(html).toContain('aria-controls="caller-content"');
      expect(html).toContain('aria-labelledby="caller-title"');
      expect(html).not.toContain('aria-controls="custom-content"');
      expect(html).not.toContain('aria-labelledby="custom-trigger"');
    });

    it(`${family} should preserve caller reference omission`, () => {
      const Root = family === 'popover' ? Popover : HoverCard;
      const Trigger = family === 'popover' ? PopoverTrigger : HoverCardTrigger;
      const Content = family === 'popover' ? PopoverContent : HoverCardContent;
      const html = renderToStringSync(() => (
        <Root defaultOpen>
          <Trigger aria-controls={null}>Open</Trigger>
          <Content aria-labelledby={null}>Body</Content>
        </Root>
      ));
      expect(html).not.toContain('aria-controls');
      expect(html).not.toContain('aria-labelledby');
    });
  }

  it('tooltip should associate the custom later content ID once', () => {
    let reads = 0;
    const LaterContent = () => (
      <TooltipContent
        id={() => {
          reads++;
          return 'custom-tooltip';
        }}
      >
        Body
      </TooltipContent>
    );
    const html = renderToStringSync(() => (
      <Tooltip defaultOpen>
        <TooltipTrigger>Open</TooltipTrigger>
        <LaterContent />
      </Tooltip>
    ));
    expect(reads).toBe(1);
    expect(html).toContain('aria-describedby="custom-tooltip"');
  });

  it.each(['caller-description', null])(
    'tooltip should preserve caller description=%s',
    (description) => {
      const html = renderToStringSync(() => (
        <Tooltip defaultOpen>
          <TooltipTrigger aria-describedby={description}>Open</TooltipTrigger>
          <TooltipContent id="custom-tooltip">Body</TooltipContent>
        </Tooltip>
      ));
      if (description === null) expect(html).not.toContain('aria-describedby');
      else expect(html).toContain('aria-describedby="caller-description"');
    }
  );
});
