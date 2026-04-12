import { defineContext, readContext, state } from '@askrjs/askr';
import {
  Presence,
  Slot,
  composeRefs,
  mergeProps,
} from '@askrjs/askr/foundations';
import { resolveCompoundId } from '../../_internal/id';
import type {
  AvatarAsChildProps,
  AvatarFallbackAsChildProps,
  AvatarFallbackProps,
  AvatarImageProps,
  AvatarLoadingStatus,
  AvatarProps,
} from './avatar.types';

type AvatarRootContextValue = {
  avatarId: string;
  status: AvatarLoadingStatus;
  setStatus: (status: AvatarLoadingStatus) => void;
};

const AvatarRootContext = defineContext<AvatarRootContextValue | null>(null);

function readAvatarRootContext(): AvatarRootContextValue {
  const context = readContext(AvatarRootContext);

  if (!context) {
    throw new Error('Avatar components must be used within <Avatar>');
  }

  return context;
}

function AvatarRootScopeView(props: {
  asChild?: boolean;
  finalProps: Record<string, unknown>;
  children?: unknown;
}) {
  if (props.asChild) {
    return (
      <Slot
        asChild
        {...props.finalProps}
        children={props.children as JSX.Element}
      />
    );
  }

  return <span {...props.finalProps}>{props.children}</span>;
}

export function Avatar(props: AvatarProps): JSX.Element;
export function Avatar(props: AvatarAsChildProps): JSX.Element;
export function Avatar(props: AvatarProps | AvatarAsChildProps) {
  const { asChild, children, id, ref, ...rest } = props;
  const avatarId = resolveCompoundId('avatar', id, children);
  const statusState = state<AvatarLoadingStatus>('idle');

  const rootContext: AvatarRootContextValue = {
    avatarId,
    status: statusState(),
    setStatus: (status) => {
      if (statusState() !== status) {
        statusState.set(status);
      }
    },
  };

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'avatar',
    'data-avatar': 'true',
    'data-state': rootContext.status,
  });

  return (
    <AvatarRootContext.Scope value={rootContext}>
      <AvatarRootScopeView
        asChild={asChild}
        finalProps={finalProps as Record<string, unknown>}
      >
        {children}
      </AvatarRootScopeView>
    </AvatarRootContext.Scope>
  );
}

export function AvatarImage(props: AvatarImageProps): JSX.Element {
  const { alt, onLoadingStatusChange, ref, src, ...rest } = props;
  const root = readAvatarRootContext();

  const setStatus = (status: AvatarLoadingStatus) => {
    root.setStatus(status);
    onLoadingStatusChange?.(status);
  };

  const finalProps = mergeProps(rest, {
    ref: composeRefs(
      ref as
        | ((value: HTMLImageElement | null) => void)
        | { current: HTMLImageElement | null }
        | null
        | undefined,
      () => {
        if (!src) {
          setStatus('error');
          return;
        }

        if (root.status === 'idle' || root.status === 'error') {
          setStatus('loading');
        }
      }
    ),
    alt,
    src,
    hidden: root.status !== 'loaded' ? true : undefined,
    'data-slot': 'avatar-image',
    'data-avatar-image': 'true',
    'data-state': root.status,
    onLoad: () => {
      setStatus('loaded');
    },
    onError: () => {
      setStatus('error');
    },
  });

  return <img {...finalProps} />;
}

export function AvatarFallback(props: AvatarFallbackProps): JSX.Element | null;
export function AvatarFallback(
  props: AvatarFallbackAsChildProps
): JSX.Element | null;
export function AvatarFallback(
  props: AvatarFallbackProps | AvatarFallbackAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readAvatarRootContext();
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'avatar-fallback',
    'data-avatar-fallback': 'true',
    'data-state': root.status,
  });

  return (
    <Presence present={root.status !== 'loaded'}>
      {asChild ? (
        <Slot asChild {...finalProps} children={children} />
      ) : (
        <span {...finalProps}>{children}</span>
      )}
    </Presence>
  );
}
