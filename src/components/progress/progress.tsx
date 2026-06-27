import { defineContext, readContext } from '@askrjs/askr';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import {
  dynamicAttributeSelector,
  removeDynamicStyleRuleWhenUnused,
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
  ProgressIndicatorAsChildProps,
  ProgressIndicatorProps,
  ProgressProps,
} from './progress.types';

type ProgressRootContextValue = {
  progressId: string;
  value: number | null;
  max: number;
  valueLabel: string;
  percentage: number | null;
};

const ProgressRootContext = defineContext<ProgressRootContextValue | null>(
  null
);

function readProgressRootContext(): ProgressRootContextValue {
  const context = readContext(ProgressRootContext);

  if (!context) {
    throw new Error('ProgressIndicator must be used within <Progress>');
  }

  return context;
}

export function Progress(props: ProgressProps) {
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
  const progressId = resolveCompoundId('progress', id, children);
  const normalizedMax = normalizeProgressMax(max);
  const normalizedValue = normalizeProgressValue(value, normalizedMax);
  const valueLabel =
    getValueLabel?.(normalizedValue, normalizedMax) ??
    defaultProgressValueLabel(normalizedValue, normalizedMax);
  const percentage = progressPercentage(normalizedValue, normalizedMax);
  const progressRuleKey = `progress:${progressId}`;
  const progressSelector = dynamicAttributeSelector('id', progressId);
  const progressPercentageValue =
    percentage === null ? '100%' : `${percentage}%`;
  setDynamicStyleRule(progressRuleKey, progressSelector, {
    '--ak-progress-percentage': progressPercentageValue,
  });
  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        if (!node) {
          removeDynamicStyleRuleWhenUnused(progressRuleKey, progressSelector);
        }
      }
    ),
    id: progressId,
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': String(normalizedMax),
    'aria-valuenow':
      normalizedValue === null ? undefined : String(normalizedValue),
    'aria-valuetext': valueLabel,
    'data-slot': 'progress',
    'data-progress': 'true',
    'data-state': normalizedValue === null ? 'indeterminate' : 'determinate',
  });
  const rootContext: ProgressRootContextValue = {
    progressId,
    value: normalizedValue,
    max: normalizedMax,
    valueLabel,
    percentage,
  };

  return (
    <ProgressRootContext.Scope value={rootContext}>
      <div {...(finalProps as Record<string, unknown>)}>{children}</div>
    </ProgressRootContext.Scope>
  );
}

export function ProgressIndicator(props: ProgressIndicatorProps): JSX.Element;
export function ProgressIndicator(
  props: ProgressIndicatorAsChildProps
): JSX.Element;
export function ProgressIndicator(
  props: ProgressIndicatorProps | ProgressIndicatorAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readProgressRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    id: resolvePartId(root.progressId, 'indicator'),
    'data-slot': 'progress-indicator',
    'data-progress-indicator': 'true',
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
