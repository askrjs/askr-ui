import { For, state } from '@askrjs/askr';
import {
  Presence,
  Slot,
  composeRefs,
  mergeProps,
} from '@askrjs/askr/foundations';
import { resource } from '@askrjs/askr/resources';
import { resolveCompoundId } from '../../_internal/id';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import type {
  AvatarAsChildProps,
  AvatarFallbackAsChildProps,
  AvatarFallbackProps,
  AvatarImageProps,
  AvatarLoadingStatus,
  AvatarProps,
} from './avatar.types';
import { AvatarContext, readAvatarContext } from './avatar.shared';

type AvatarEntry = {
  src: string | null;
  status: AvatarLoadingStatus;
};

const avatarEntries = new Map<string, AvatarEntry>();

function getAvatarEntry(avatarId: string) {
  const existing = avatarEntries.get(avatarId);

  if (existing) {
    return existing;
  }

  const created: AvatarEntry = {
    src: null,
    status: 'idle',
  };
  avatarEntries.set(avatarId, created);
  return created;
}

function AvatarView(props: {
  children?: unknown;
  asChild: boolean;
  finalProps: Record<string, unknown>;
}) {
  const keyedChildren = For<unknown>(
    () => toChildArray(props.children),
    (child, index) =>
      isJsxElement(child) && child.key != null ? child.key : index,
    (child) => child as never
  );

  return props.asChild ? (
    <Slot
      asChild
      {...props.finalProps}
      children={props.children as JSX.Element}
    />
  ) : (
    <span {...props.finalProps}>{keyedChildren}</span>
  );
}

export function Avatar(props: AvatarProps): JSX.Element;
export function Avatar(props: AvatarAsChildProps): JSX.Element;
export function Avatar(props: AvatarProps | AvatarAsChildProps) {
  const { asChild, children, id, ref, ...rest } = props;
  const avatarId = resolveCompoundId('avatar', id, children);
  const entry = getAvatarEntry(avatarId);
  const statusVersion = state(0);

  statusVersion();

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'avatar',
    'data-avatar': 'true',
    'data-state': entry.status,
  });
  const context = {
    avatarId,
    get status() {
      return entry.status;
    },
    setStatus: (status: AvatarLoadingStatus) => {
      entry.status = status;
      statusVersion.set(statusVersion() + 1);
    },
  };

  return (
    <AvatarContext.Scope value={context}>
      <AvatarView asChild={asChild === true} finalProps={finalProps}>
        {children}
      </AvatarView>
    </AvatarContext.Scope>
  );
}

export function AvatarImage(props: AvatarImageProps): JSX.Element {
  const { alt, onLoadingStatusChange, ref, src, ...rest } = props;
  const { avatarId, setStatus } = readAvatarContext();
  const entry = getAvatarEntry(avatarId);
  const normalizedSrc = typeof src === 'string' && src ? src : null;
  const sourceChanged = entry.src !== normalizedSrc;

  if (sourceChanged) {
    entry.src = normalizedSrc;
    entry.status = normalizedSrc ? 'loading' : 'error';
  }

  resource(() => {
    if (sourceChanged) {
      setStatus(entry.status);
    }
    return null;
  }, [avatarId, normalizedSrc, sourceChanged]);

  const status = entry.status;

  const updateStatus = (nextStatus: AvatarLoadingStatus) => {
    setStatus(nextStatus);
    onLoadingStatusChange?.(nextStatus);
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
          updateStatus('error');
        }
      }
    ),
    alt,
    src,
    hidden: status !== 'loaded',
    'data-slot': 'avatar-image',
    'data-avatar-image': 'true',
    'data-state': status,
    onLoad: () => {
      updateStatus('loaded');
    },
    onError: () => {
      updateStatus('error');
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
  const { status } = readAvatarContext();
  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'avatar-fallback',
    'data-avatar-fallback': 'true',
    'data-state': status,
  });

  return (
    <Presence present={status !== 'loaded'}>
      {asChild ? (
        <Slot asChild {...finalProps} children={children} />
      ) : (
        <span {...finalProps}>{children}</span>
      )}
    </Presence>
  );
}
