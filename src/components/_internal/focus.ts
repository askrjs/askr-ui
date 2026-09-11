// Barrel re-export: focus behavior lives in `./focus/*`, split by concern
// (input-modality tracking, focusable/tabbable DOM queries, popup-dismiss
// Tab handling, composite/collection item focus + restore, and
// disabled-item focus repair). This file preserves the original import
// path so existing consumers are unaffected.
export {
  isKeyboardModality,
  markKeyboardModality,
  markPointerModality,
} from './focus/modality';

export {
  focusFirstDescendant,
  focusLastDescendant,
  getFocusableElements,
  getTabbableElements,
} from './focus/query';

export {
  dismissPopupWithTab,
  moveFocusOutsideCompositeWithTab,
} from './focus/dismiss';

export type {
  CompositeItemFocusTracker,
  PendingCollectionFocus,
} from './focus/composite';
export {
  claimOpenAutoFocus,
  compositeItemFocusProps,
  focusCollectionItemWithRestore,
  focusSelectedCollectionItem,
  restorePendingCollectionItemFocus,
} from './focus/composite';

export { repairFocusForDisabledItem } from './focus/repair';
