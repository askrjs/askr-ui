import { defineContext, readContext } from '@askrjs/askr';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import {
  dynamicAttributeSelector,
  removeDynamicStyleRule,
  setDynamicStyleRule,
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
  defineContext<ProgressCircleRootContextValue | null>(null);

function readProgressCircleRootContext(): ProgressCircleRootContextValue {
  const context = readContext(ProgressCircleRootContext);

  if (!context) {
    throw new Error(
      'ProgressCircleIndicator must be used within <ProgressCircle>'
    );
  }

  return context;
}

export function ProgressCircle(props: ProgressCircleProps) {
  const {
    children,
    getValueLabel,
    id,
    max,
    ref,
    style: _style,
    value,
    ...rest
  } = props;
  const progressCircleId = resolveCompoundId('progress-circle', id, children);
  const normalizedMax = normalizeProgressMax(max);
  const normalizedValue = normalizeProgressValue(value, normalizedMax);
  const valueLabel =
    getValueLabel?.(normalizedValue, normalizedMax) ??
    defaultProgressValueLabel(normalizedValue, normalizedMax);
  const percentage = progressPercentage(normalizedValue, normalizedMax);
  const progressCircleRuleKey = `progress-circle:${progressCircleId}`;
  const progressCirclePercentageValue =
    percentage === null ? '25%' : `${percentage}%`;
  setDynamicStyleRule(
    progressCircleRuleKey,
    dynamicAttributeSelector('id', progressCircleId),
    {
      '--ak-progress-percentage': progressCirclePercentageValue,
    }
  );
  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        if (!node) {
          removeDynamicStyleRule(progressCircleRuleKey);
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
    <ProgressCircleRootContext.Scope value={rootContext}>
      <div {...(finalProps as Record<string, unknown>)}>{children}</div>
    </ProgressCircleRootContext.Scope>
  );
}

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
  const finalProps = mergeProps(rest, {
    ref,
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

  return <div {...finalProps}>{children}</div>;
}
