import type { Ref } from '@askrjs/askr/foundations/utilities';
import { clampRangeValue } from './range';

export type VirtualOverscan =
  | number
  | {
      before?: number;
      after?: number;
    };

export type VirtualScrollAlignment = 'start' | 'center' | 'end';

export type VirtualRange = {
  totalCount: number;
  rowHeight: number;
  scrollTop: number;
  viewportHeight: number;
  totalHeight: number;
  visibleStartIndex: number;
  visibleEndIndex: number;
  visibleCount: number;
  renderStartIndex: number;
  renderEndIndex: number;
  renderedCount: number;
  beforeSpacerHeight: number;
  afterSpacerHeight: number;
  isAtTop: boolean;
  isAtBottom: boolean;
};

export type VirtualAnchor = {
  key: string;
  offset: number;
};

export function normalizeVirtualOverscan(
  overscan: VirtualOverscan | undefined
) {
  if (typeof overscan === 'number') {
    const normalized = Math.max(0, Math.floor(overscan));
    return {
      before: normalized,
      after: normalized,
    };
  }

  const before = Math.max(0, Math.floor(overscan?.before ?? 0));
  const after = Math.max(0, Math.floor(overscan?.after ?? before));

  return {
    before,
    after,
  };
}

export function assertPositiveVirtualHeight(
  value: number,
  name: string
): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number`);
  }

  return value;
}

export function clampVirtualIndex(index: number, totalCount: number): number {
  if (totalCount <= 0) {
    return -1;
  }

  return clampRangeValue(Math.floor(index), 0, totalCount - 1);
}

export function resolveVirtualTotalHeight(
  totalCount: number,
  rowHeight: number
): number {
  return totalCount * rowHeight;
}

export function resolveVirtualStyleHeight(style: unknown): number {
  if (!style || typeof style !== 'object') {
    return 0;
  }

  const height = (style as { height?: unknown }).height;

  if (typeof height === 'number') {
    return Math.max(0, height);
  }

  if (typeof height === 'string') {
    return Math.max(0, Number.parseFloat(height) || 0);
  }

  return 0;
}

export function resolveVirtualRange(options: {
  totalCount: number;
  rowHeight: number;
  scrollTop: number;
  viewportHeight: number;
  overscan?: VirtualOverscan;
}): VirtualRange {
  const totalCount = Math.max(0, Math.floor(options.totalCount));
  const rowHeight = assertPositiveVirtualHeight(options.rowHeight, 'rowHeight');
  const viewportHeight = Math.max(0, Number(options.viewportHeight) || 0);
  const totalHeight = resolveVirtualTotalHeight(totalCount, rowHeight);

  if (totalCount === 0) {
    return {
      totalCount,
      rowHeight,
      scrollTop: 0,
      viewportHeight,
      totalHeight,
      visibleStartIndex: -1,
      visibleEndIndex: -1,
      visibleCount: 0,
      renderStartIndex: -1,
      renderEndIndex: -1,
      renderedCount: 0,
      beforeSpacerHeight: 0,
      afterSpacerHeight: 0,
      isAtTop: true,
      isAtBottom: true,
    };
  }

  const overscan = normalizeVirtualOverscan(options.overscan);
  const maxScrollTop = Math.max(0, totalHeight - viewportHeight);
  const clampedScrollTop = clampRangeValue(
    Math.max(0, Number(options.scrollTop) || 0),
    0,
    maxScrollTop
  );
  const visibleCount = Math.max(
    1,
    Math.ceil(viewportHeight > 0 ? viewportHeight / rowHeight : 1)
  );
  const visibleStartIndex = clampVirtualIndex(
    Math.floor(clampedScrollTop / rowHeight),
    totalCount
  );
  const visibleEndIndex = clampVirtualIndex(
    visibleStartIndex + visibleCount - 1,
    totalCount
  );
  const renderStartIndex = clampVirtualIndex(
    visibleStartIndex - overscan.before,
    totalCount
  );
  const renderEndIndex = clampVirtualIndex(
    visibleEndIndex + overscan.after,
    totalCount
  );
  const renderedCount =
    renderStartIndex === -1 || renderEndIndex === -1
      ? 0
      : renderEndIndex - renderStartIndex + 1;

  return {
    totalCount,
    rowHeight,
    scrollTop: clampedScrollTop,
    viewportHeight,
    totalHeight,
    visibleStartIndex,
    visibleEndIndex,
    visibleCount:
      visibleEndIndex >= visibleStartIndex
        ? visibleEndIndex - visibleStartIndex + 1
        : 0,
    renderStartIndex,
    renderEndIndex,
    renderedCount,
    beforeSpacerHeight: renderStartIndex < 0 ? 0 : renderStartIndex * rowHeight,
    afterSpacerHeight:
      renderEndIndex < 0
        ? 0
        : Math.max(0, totalHeight - (renderEndIndex + 1) * rowHeight),
    isAtTop: clampedScrollTop <= 0,
    isAtBottom: resolveVirtualIsAtBottom(
      clampedScrollTop,
      viewportHeight,
      totalHeight
    ),
  };
}

export function resolveVirtualScrollTopForIndex(
  index: number,
  rowHeight: number,
  viewportHeight: number,
  totalCount?: number,
  alignment: VirtualScrollAlignment = 'start'
): number {
  const safeRowHeight = assertPositiveVirtualHeight(rowHeight, 'rowHeight');
  const clampedIndex =
    typeof totalCount === 'number'
      ? clampVirtualIndex(index, totalCount)
      : Math.max(0, Math.floor(index));
  const rowTop = clampedIndex < 0 ? 0 : clampedIndex * safeRowHeight;
  const safeViewportHeight = Math.max(0, viewportHeight);
  const maxScrollTop =
    typeof totalCount === 'number'
      ? Math.max(0, totalCount * safeRowHeight - safeViewportHeight)
      : Number.POSITIVE_INFINITY;

  if (alignment === 'center') {
    const centered = rowTop - safeViewportHeight / 2 + safeRowHeight / 2;
    return clampRangeValue(Math.max(0, centered), 0, maxScrollTop);
  }

  if (alignment === 'end') {
    const alignedEnd = rowTop - safeViewportHeight + safeRowHeight;
    return clampRangeValue(Math.max(0, alignedEnd), 0, maxScrollTop);
  }

  return clampRangeValue(rowTop, 0, maxScrollTop);
}

export function resolveVirtualScrollTopForBottom(
  totalHeight: number,
  viewportHeight: number
): number {
  return Math.max(0, totalHeight - Math.max(0, viewportHeight));
}

export function resolveVirtualIsAtBottom(
  scrollTop: number,
  viewportHeight: number,
  totalHeight: number,
  threshold = 1
): boolean {
  return scrollTop + viewportHeight >= totalHeight - Math.max(0, threshold);
}

export function buildVirtualKeyIndexMap(keys: readonly string[]) {
  const indexMap = new Map<string, number>();

  for (let index = 0; index < keys.length; index += 1) {
    indexMap.set(keys[index], index);
  }

  return indexMap;
}

export function resolveVirtualRetainedAnchorKey(
  previousVisibleKeys: readonly string[],
  nextKeyIndexMap: Map<string, number>
): string | null {
  for (const key of previousVisibleKeys) {
    if (nextKeyIndexMap.has(key)) {
      return key;
    }
  }

  return null;
}

export function createVirtualAnchor(
  visibleKeys: readonly string[],
  visibleStartIndex: number,
  scrollTop: number,
  rowHeight: number
): VirtualAnchor | null {
  const key = visibleKeys[0];

  if (!key || visibleStartIndex < 0) {
    return null;
  }

  return {
    key,
    offset: scrollTop - visibleStartIndex * rowHeight,
  };
}

export function resolveVirtualScrollTopFromAnchor(
  anchor: VirtualAnchor,
  nextKeyIndexMap: Map<string, number>,
  rowHeight: number
): number | null {
  const nextIndex = nextKeyIndexMap.get(anchor.key);

  if (nextIndex === undefined) {
    return null;
  }

  return nextIndex * rowHeight + anchor.offset;
}

export function isVirtualAppendOnly(
  previousKeys: readonly string[],
  nextKeys: readonly string[]
): boolean {
  if (nextKeys.length < previousKeys.length) {
    return false;
  }

  for (let index = 0; index < previousKeys.length; index += 1) {
    if (previousKeys[index] !== nextKeys[index]) {
      return false;
    }
  }

  return true;
}

export function resolveVirtualAppendedCount(
  previousKeys: readonly string[],
  nextKeys: readonly string[]
): number {
  return isVirtualAppendOnly(previousKeys, nextKeys)
    ? nextKeys.length - previousKeys.length
    : 0;
}

export function isSameVirtualRange(
  left: VirtualRange,
  right: VirtualRange
): boolean {
  return (
    left.totalCount === right.totalCount &&
    left.rowHeight === right.rowHeight &&
    left.scrollTop === right.scrollTop &&
    left.viewportHeight === right.viewportHeight &&
    left.totalHeight === right.totalHeight &&
    left.visibleStartIndex === right.visibleStartIndex &&
    left.visibleEndIndex === right.visibleEndIndex &&
    left.visibleCount === right.visibleCount &&
    left.renderStartIndex === right.renderStartIndex &&
    left.renderEndIndex === right.renderEndIndex &&
    left.renderedCount === right.renderedCount &&
    left.beforeSpacerHeight === right.beforeSpacerHeight &&
    left.afterSpacerHeight === right.afterSpacerHeight &&
    left.isAtTop === right.isAtTop &&
    left.isAtBottom === right.isAtBottom
  );
}

export function setRefValue<T>(ref: Ref<T> | undefined, value: T) {
  if (!ref) {
    return;
  }

  if (typeof ref === 'function') {
    ref(value);
    return;
  }

  (ref as { current: T }).current = value;
}
