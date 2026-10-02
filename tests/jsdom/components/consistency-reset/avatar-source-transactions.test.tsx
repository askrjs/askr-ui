import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import { state } from '@askrjs/askr';
import { flush, mount, type RenderResult } from '@askrjs/askr/testing';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../../src/components/avatar';

const views: RenderResult[] = [];
async function settle() {
  for (let i = 0; i < 6; i += 1) {
    await Promise.resolve();
    flush();
  }
}
afterEach(async () => {
  for (const view of views.splice(0)) view.unmount();
  await settle();
  vi.restoreAllMocks();
});

describe('avatar source transactions', () => {
  it('should reset to loading when an image source change follows a rejected update', async () => {
    let source!: ReturnType<typeof state<string>>;
    let rejected!: ReturnType<typeof state<boolean>>;
    const view = mount(() => {
      source = state('/a.png');
      rejected = state(false);
      const isRejected = rejected();
      return (
        <>
          <Avatar>
            <AvatarImage src={isRejected ? '/b.png' : source()} alt="Person" />
            <AvatarFallback>PP</AvatarFallback>
          </Avatar>
          {isRejected ? <i>Insert failure</i> : null}
        </>
      );
    });
    views.push(view);
    await settle();
    const image = () => view.container.querySelector('img')!;
    image().dispatchEvent(new Event('load'));
    await settle();
    expect(image().getAttribute('data-state')).toBe('loaded');

    const failure = new Error('forced structural commit failure');
    const insertion = vi
      .spyOn(view.container, 'insertBefore')
      .mockImplementation(() => {
        throw failure;
      });
    try {
      rejected.set(true);
      expect(() => flush()).toThrow(failure);
    } finally {
      insertion.mockRestore();
    }
    rejected.set(false);
    source.set('/b.png');
    await settle();

    expect(image().getAttribute('src')).toBe('/b.png');
    expect(image().getAttribute('data-state')).toBe('loading');
    expect(image().hidden).toBe(true);
  });
});
