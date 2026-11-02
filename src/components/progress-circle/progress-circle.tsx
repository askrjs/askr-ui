import type { JSX } from '@askrjs/askr/jsx-runtime';
import { cspNonce, defineScope, readScope } from '@askrjs/askr';
import { Slot } from '@askrjs/askr/foundations/structures';
import {
  composeRefs,
  mergeProps,
  type Ref,
} from '@askrjs/askr/foundations/utilities';
import { nativeRef } from '../_internal/native-ref';
import {
  dynamicAttributeSelector,
  removeDynamicStyleRuleWhenUnused,
  setCommittedDynamicStyleRule,
} from '../_internal/dynamic-style';
import { resolveCompoundId, resolvePartId } from '../_internal/id';
import {
  defaultProgressValueLabel,
  normalizeProgressMax,
  normalizeProgressValue,
  progressPercentage,
} from '../_internal/progress';
import type {
  ProgressCircleIndicatorAsChildProps,
  ProgressCircleIndicatorProps,
  ProgressCircleProps,
} from './progress-circle.types';

type ProgressCircleRootContextValue = {
  progressCircleId: string;
  value: number | null;
  max: number;
  valueLabel: string;
  percentage: number | null;
};

const ProgressCircleRootContext =
  defineScope<ProgressCircleRootContextValue | null>(null);

function readProgressCircleIndicatorChildRef(
  children: unknown
): Ref<Element> | undefined {
  if (typeof children !== 'object' || children === null) return undefined;
  return (children as { props?: { ref?: Ref<Element> } }).props?.ref;
}

function omitProgressCircleStateAriaProps<T extends object>(props: T): T {
  let result: T | undefined;
  for (const attribute of [
    'role',
    'aria-valuemin',
    'aria-valuemax',
    'aria-valuenow',
    'aria-valuetext',
  ]) {
    if (!Object.prototype.hasOwnProperty.call(props, attribute)) continue;
    result ??= { ...props };
    delete (result as Record<string, unknown>)[attribute];
  }
  return result ?? props;
}

function readProgressCircleRootContext(): ProgressCircleRootContextValue {
  const context = readScope(ProgressCircleRootContext);

  if (!context) {
    throw new Error(
      'ProgressCircleIndicator must be used within <ProgressCircle>'
    );
  }

  return context;
}

/**
 * Headless circular progress indicator root.
 *
 * Normalizes value/max, computes percentage, exposes `--ak-progress-percentage`
 * as a dynamically injected CSS custom property, and provides progress state
 * to `ProgressCircleIndicator` via context.
 */
export function ProgressCircle(props: ProgressCircleProps) {
  const nonce = cspNonce();
  const { children, getValueLabel, id, max, ref, value, ...rest } = props;
  const progressCircleId = resolveCompoundId('progress-circle', id, children);
  const normalizedMax = normalizeProgressMax(max);
  const normalizedValue = normalizeProgressValue(value, normalizedMax);
  const valueLabel =
    getValueLabel?.(normalizedValue, normalizedMax) ??
    defaultProgressValueLabel(normalizedValue, normalizedMax);
  const percentage = progressPercentage(normalizedValue, normalizedMax);
  const progressCircleRuleKey = `progress-circle:${progressCircleId}`;
  const progressCircleSelector = dynamicAttributeSelector(
    'id',
    progressCircleId
  );
  const progressCirclePercentageValue =
    percentage === null ? '25%' : `${percentage}%`;
  setCommittedDynamicStyleRule(
    progressCircleRuleKey,
    progressCircleSelector,
    {
      '--ak-progress-percentage': progressCirclePercentageValue,
    },
    nonce
  );
  const finalProps = mergeProps(omitProgressCircleStateAriaProps(rest), {
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        if (!node) {
          removeDynamicStyleRuleWhenUnused(
            progressCircleRuleKey,
            progressCircleSelector
          );
        }
      }
    ),
    id: progressCircleId,
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': String(normalizedMax),
    'aria-valuenow':
      normalizedValue === null ? undefined : String(normalizedValue),
    'aria-valuetext': valueLabel,
    'data-slot': 'progress-circle',
    'data-progress-circle': 'true',
    'data-state': normalizedValue === null ? 'indeterminate' : 'determinate',
  });
  const rootContext: ProgressCircleRootContextValue = {
    progressCircleId,
    value: normalizedValue,
    max: normalizedMax,
    valueLabel,
    percentage,
  };

  return (
    <ProgressCircleRootContext value={rootContext}>
      <div {...(finalProps as Record<string, unknown>)}>{children}</div>
    </ProgressCircleRootContext>
  );
}

/**
 * Visual indicator for `ProgressCircle`, rendering the fill/arc element.
 * Must be used within a `ProgressCircle`; reads progress state from context
 * and exposes it as `data-state`/`data-value`/`data-max`/`data-percentage`.
 */
export function ProgressCircleIndicator(
  props: ProgressCircleIndicatorProps
): JSX.Element;
export function ProgressCircleIndicator(
  props: ProgressCircleIndicatorAsChildProps
): JSX.Element;
export function ProgressCircleIndicator(
  props: ProgressCircleIndicatorProps | ProgressCircleIndicatorAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readProgressCircleRootContext();
  const childRef = asChild
    ? readProgressCircleIndicatorChildRef(children)
    : undefined;
  const finalProps = mergeProps(rest, {
    ref: asChild ? composeRefs(ref as Ref<Element> | undefined, childRef) : ref,
    id: resolvePartId(root.progressCircleId, 'indicator'),
    'data-slot': 'progress-circle-indicator',
    'data-progress-circle-indicator': 'true',
    'data-state': root.value === null ? 'indeterminate' : 'determinate',
    'data-value': root.value === null ? undefined : String(root.value),
    'data-max': String(root.max),
    'data-percentage':
      root.percentage === null ? undefined : String(root.percentage),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <div {...finalProps} ref={nativeRef<HTMLDivElement>(props)}>
      {children}
    </div>
  );
}
