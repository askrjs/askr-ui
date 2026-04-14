import { defineContext, readContext } from '@askrjs/askr';
import { Slot, mergeProps } from '@askrjs/askr/foundations';
import { mergeCssVar } from '../../_internal/style';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import { mapJsxTree } from '../../_internal/jsx';
import {
  defaultProgressValueLabel,
  normalizeProgressMax,
  normalizeProgressValue,
  progressPercentage,
} from '../../_internal/progress';
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

function ProgressRootScopeView(props: {
  finalProps: Record<string, unknown>;
  children?: unknown;
}) {
  return <div {...props.finalProps}>{props.children}</div>;
}

export function Progress(props: ProgressProps) {
  const { children, getValueLabel, id, max, ref, value, ...rest } = props;
  const progressId = resolveCompoundId('progress', id, children);
  const normalizedMax = normalizeProgressMax(max);
  const normalizedValue = normalizeProgressValue(value, normalizedMax);
  const valueLabel =
    getValueLabel?.(normalizedValue, normalizedMax) ??
    defaultProgressValueLabel(normalizedValue, normalizedMax);
  const percentage = progressPercentage(normalizedValue, normalizedMax);
  const finalProps = mergeProps(rest, {
    ref,
    id: progressId,
    style: mergeCssVar(
      (rest as { style?: unknown }).style,
      '--ak-progress-percentage',
      percentage === null ? '100%' : `${percentage}%`
    ),
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
  };

  return (
    <ProgressRootContext.Scope value={rootContext}>
      <ProgressRootScopeView finalProps={finalProps as Record<string, unknown>}>
        {children}
      </ProgressRootScopeView>
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
  const percentage = progressPercentage(root.value, root.max);
  const finalProps = mergeProps(rest, {
    ref,
    id: resolvePartId(root.progressId, 'indicator'),
    'data-slot': 'progress-indicator',
    'data-progress-indicator': 'true',
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
