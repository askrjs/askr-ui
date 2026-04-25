import {
  Presence,
  Slot,
  type JSXElement,
  type PresenceProps,
  type SlotProps,
} from '@askrjs/askr/foundations';
import {
  createCollection,
  type Collection,
  type CollectionItem,
} from './structures/collection';
import {
  createLayer,
  type Layer,
  type LayerManager,
  type LayerOptions,
} from './structures/layer';
import {
  composeHandlers,
  type ComposeHandlersOptions,
} from './utilities/compose-handlers';
import { mergeProps } from './utilities/merge-props';
import { ariaDisabled, ariaExpanded, ariaSelected } from './utilities/aria';
import { composeRefs, setRef, type Ref } from './utilities/compose-ref';
import { formatId, type FormatIdOptions } from './utilities/use-id';
import {
  pressable,
  type PressableOptions,
  type PressableResult,
} from './interactions/pressable';
import {
  dismissable,
  type DismissableOptions,
} from './interactions/dismissable';
import {
  focusable,
  type FocusableOptions,
  type FocusableResult,
} from './interactions/focusable';
import {
  hoverable,
  type HoverableOptions,
  type HoverableResult,
} from './interactions/hoverable';
import {
  rovingFocus,
  type Orientation,
  type RovingFocusOptions,
  type RovingFocusResult,
} from './interactions/roving-focus';
import {
  applyInteractionPolicy,
  mergeInteractionProps,
  type InteractionPolicyInput,
} from './interactions/interaction-policy';
import {
  isControlled,
  resolveControllable,
  makeControllable,
  controllableState,
  type ControllableState,
} from './state/controllable';

export {
  Presence,
  Slot,
  createCollection,
  createLayer,
  composeHandlers,
  mergeProps,
  ariaDisabled,
  ariaExpanded,
  ariaSelected,
  composeRefs,
  setRef,
  formatId,
  pressable,
  dismissable,
  focusable,
  hoverable,
  rovingFocus,
  applyInteractionPolicy,
  mergeInteractionProps,
  isControlled,
  resolveControllable,
  makeControllable,
  controllableState,
};

export type {
  JSXElement,
  PresenceProps,
  SlotProps,
  Collection,
  CollectionItem,
  Layer,
  LayerManager,
  LayerOptions,
  ComposeHandlersOptions,
  Ref,
  FormatIdOptions,
  PressableOptions,
  PressableResult,
  DismissableOptions,
  FocusableOptions,
  FocusableResult,
  HoverableOptions,
  HoverableResult,
  Orientation,
  RovingFocusOptions,
  RovingFocusResult,
  InteractionPolicyInput,
  ControllableState,
};
