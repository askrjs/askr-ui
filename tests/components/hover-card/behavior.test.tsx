import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../../src/components/composites/hover-card';
import { flushUpdates, mount, unmount } from '../../test-utils';

describe('HoverCard - Behavior', () => {
  let container: HTMLElement | undefined;

  afterEach(() => {
    vi.useRealTimers();
    unmount(container);
    container = undefined;
  });

  it('renders open state and canonical trigger/content hooks', async () => {
    container = mount(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Preview</HoverCardTrigger>
        <HoverCardContent>Details</HoverCardContent>
      </HoverCard>
    );

    const trigger = container.querySelector(
      '[data-slot="hover-card-trigger"]'
    ) as HTMLElement;

    let content = document.body.querySelector(
      '[data-slot="hover-card-content"]'
    ) as HTMLElement | null;

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(content?.getAttribute('data-state')).toBe('open');

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(content?.getAttribute('data-state')).toBe('open');
  });

  it('supports asChild composition on the trigger and content', async () => {
    container = mount(
      <HoverCard defaultOpen>
        <HoverCardTrigger asChild>
          <a href="/preview">Preview</a>
        </HoverCardTrigger>
        <HoverCardContent asChild>
          <section>Details</section>
        </HoverCardContent>
      </HoverCard>
    );

    await flushUpdates();

    const trigger = container.querySelector('a') as HTMLAnchorElement | null;
    const content = document.body.querySelector(
      'section[data-slot="hover-card-content"]'
    ) as HTMLElement | null;

    expect(trigger?.getAttribute('data-slot')).toBe('hover-card-trigger');
    expect(content?.getAttribute('data-slot')).toBe('hover-card-content');
  });
});
