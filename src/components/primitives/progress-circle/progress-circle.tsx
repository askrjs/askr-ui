import { defineContext, readContext } from '@askrjs/askr';
import { Slot, mergeProps } from '@askrjs/askr/foundations';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { mergeCssVar } from '../../_internal/style';
import {
  defaultProgressValueLabel,
  normalizeProgressMax,
  normalizeProgressValue,
  progressPercentage,
} from '../../_internal/progress';
import type {
  ProgressCircleIndicatorAsChildProps,
  ProgressCircleIndicatorProps,
  ProgressCircleProps,
  SpinnerProps,
} from './progress-circle.types';

type ProgressCircleRootContextValue = {
  progressCircleId: string;
  value: number | null;
  max: number;
  valueLabel: string;
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

function ProgressCircleRootScopeView(props: {
  finalProps: Record<string, unknown>;
  children?: unknown;
}) {
  return <div {...props.finalProps}>{props.children}</div>;
}

export function ProgressCircle(props: ProgressCircleProps) {
  const { children, getValueLabel, id, max, ref, value, ...rest } = props;
  const progressCircleId = resolveCompoundId('progress-circle', id, children);
  const normalizedMax = normalizeProgressMax(max);
  const normalizedValue = normalizeProgressValue(value, normalizedMax);
  const valueLabel =
    getValueLabel?.(normalizedValue, normalizedMax) ??
    defaultProgressValueLabel(normalizedValue, normalizedMax);
  const percentage = progressPercentage(normalizedValue, normalizedMax);
  const finalProps = mergeProps(rest, {
    ref,
    id: progressCircleId,
    style: mergeCssVar(
      (rest as { style?: unknown }).style,
      '--ak-progress-percentage',
      percentage === null ? '25%' : `${percentage}%`
    ),
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
  };

  return (
    <ProgressCircleRootContext.Scope value={rootContext}>
      <ProgressCircleRootScopeView
        finalProps={finalProps as Record<string, unknown>}
      >
        {children}
      </ProgressCircleRootScopeView>
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
  const percentage = progressPercentage(root.value, root.max);
  const finalProps = mergeProps(rest, {
    ref,
    id: resolvePartId(root.progressCircleId, 'indicator'),
    'data-slot': 'progress-circle-indicator',
    'data-progress-circle-indicator': 'true',
    'data-state': root.value === null ? 'indeterminate' : 'determinate',
    'data-value': root.value === null ? undefined : String(root.value),
    'data-max': String(root.max),
    'data-percentage': percentage === null ? undefined : String(percentage),
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return <div {...finalProps}>{children}</div>;
}

export function Spinner(props: SpinnerProps) {
  const {
    label,
    'aria-label': ariaLabel,
    ...rest
  } = props as SpinnerProps & { 'aria-label'?: string };

  return (
    <ProgressCircle
      {...rest}
      aria-label={ariaLabel ?? label ?? 'Loading'}
      value={null}
      getValueLabel={() => label ?? 'Loading'}
    />
  );
}
