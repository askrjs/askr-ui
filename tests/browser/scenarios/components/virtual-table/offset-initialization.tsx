import type { Ref } from '@askrjs/askr/foundations/utilities';
import {
  VirtualList,
  type VirtualListApi,
} from '../../../../../src/components/virtual-list';
import {
  VirtualTable,
  type VirtualTableApi,
} from '../../../../../src/components/virtual-table';
import { mount, settle, flushUpdates } from '../../_mount';

type Api = VirtualListApi<number> | VirtualTableApi<number>;
type Options = {
  kind: 'list' | 'table';
  callbacks?: boolean;
  apiCallbackOnly?: boolean;
  apiAccessorOnly?: boolean;
  changeChildOffset?: boolean;
  revealBeforeSetup?: boolean;
  nativeScrollBeforeSetup?: boolean;
};
const items = Array.from({ length: 20 }, (_, index) => index);

export async function initialOffset(root: HTMLElement, options: Options) {
  const apiRef = { current: null as Api | null };
  const callbackOffsets: number[] = [];
  const callerRef = (node: HTMLElement | null) => {
    if (node) callbackOffsets.push(node.scrollTop);
  };
  const callbackApiRef = (api: Api | null) => {
    apiRef.current = api;
    if (api) {
      const node = root.querySelector<HTMLElement>('[data-offset-probe]');
      if (!node) throw new Error('Missing viewport during API callback');
      callbackOffsets.push(node.scrollTop);
    }
  };
  const accessorApiRef = {
    get current() {
      return apiRef.current;
    },
    set current(api: Api | null) {
      callbackApiRef(api);
    },
  };
  const suppliedApiRef = options.apiAccessorOnly
    ? accessorApiRef
    : options.callbacks || options.apiCallbackOnly
      ? callbackApiRef
      : apiRef;
  const childRef = (node: HTMLElement | null) => {
    if (!node || !options.changeChildOffset) return;
    node.style.display = 'block';
    node.style.height = '560px';
    const viewport = node.closest<HTMLElement>('[data-offset-probe]');
    if (viewport) viewport.scrollTop = 56;
  };
  const common = {
    'data-offset-probe': options.kind,
    ref: options.callbacks ? callerRef : undefined,
    rowHeight: 28,
    getKey: (item: number) => item,
    style: { height: '112px', overflow: 'auto' },
  };
  mount(
    options.kind === 'list' ? (
      <VirtualList
        {...common}
        items={items}
        apiRef={suppliedApiRef as Ref<VirtualListApi<number> | null>}
        rowComponent={({ item }) => <span ref={childRef}>{item}</span>}
      />
    ) : (
      <VirtualTable
        {...common}
        rows={items}
        headerHeight={28}
        apiRef={suppliedApiRef as Ref<VirtualTableApi<number> | null>}
        columns={[
          {
            id: 'value',
            header: 'Value',
            cellComponent: ({ row }) => <span ref={childRef}>{row}</span>,
          },
        ]}
      />
    ),
    root
  );
  const initial = {
    apiAvailable: apiRef.current !== null,
    apiScrollTop: apiRef.current?.getScrollTop() ?? null,
  };
  const viewport = root.querySelector<HTMLElement>('[data-offset-probe]');
  if (!viewport) throw new Error('Missing offset viewport');
  if (options.revealBeforeSetup) apiRef.current?.scrollToIndex(6);
  if (options.nativeScrollBeforeSetup) {
    viewport.scrollTop = 84;
    viewport.dispatchEvent(new Event('scroll'));
  }
  const firstFrame = new Promise<{
    physical: number;
    logical: number | null;
    visibleStart: number;
    viewportHeight: number;
  }>((resolve) => {
    requestAnimationFrame(() =>
      resolve({
        physical: viewport.scrollTop,
        logical: apiRef.current?.getScrollTop() ?? null,
        visibleStart: apiRef.current?.getVisibleRange().visibleStartIndex ?? -1,
        viewportHeight: viewport.clientHeight,
      })
    );
  });
  await settle();
  const firstFramePosition = await firstFrame;
  return {
    initial: () => initial,
    callbackOffsets: () => callbackOffsets,
    firstFrame: () => firstFramePosition,
    position: () => ({
      physical: viewport.scrollTop,
      logical: apiRef.current?.getScrollTop() ?? null,
    }),
    userScroll: async (top: number) => {
      viewport.scrollTop = top;
      viewport.dispatchEvent(new Event('scroll'));
      await flushUpdates();
    },
    revealThenReturnToZero: async () => {
      apiRef.current?.scrollToIndex(6);
      viewport.scrollTop = 0;
      viewport.dispatchEvent(new Event('scroll'));
      await settle();
      return {
        physical: viewport.scrollTop,
        logical: apiRef.current?.getScrollTop() ?? null,
      };
    },
  };
}
