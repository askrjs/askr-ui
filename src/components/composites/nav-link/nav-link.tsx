import { Link, currentRoute } from '@askrjs/askr/router';
import { Slot, mergeProps, type JSXElement } from '@askrjs/ui/foundations';
import type { NavLinkAsChildProps, NavLinkProps } from './nav-link.types';

type RouteSnapshot = ReturnType<typeof currentRoute>;

function serializeQuery(query: RouteSnapshot['query']): string {
  const values = query.toJSON();
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item));
      }
      continue;
    }

    searchParams.set(key, String(value));
  }

  const search = searchParams.toString();
  return search ? `?${search}` : '';
}

function getSnapshotHref(snapshot: RouteSnapshot): string {
  return `${snapshot.path}${serializeQuery(snapshot.query)}${snapshot.hash ?? ''}`;
}

function getBaseUrl(snapshot: RouteSnapshot): URL {
  if (typeof window !== 'undefined') {
    const href =
      typeof window.location.href === 'string' ? window.location.href : '';

    if (
      href &&
      href !== 'about:blank' &&
      !href.startsWith('about:') &&
      !href.startsWith('data:')
    ) {
      return new URL(href);
    }
  }

  return new URL(`http://localhost${getSnapshotHref(snapshot)}`);
}

function resolveTargetUrl(href: string, baseUrl: URL): URL | null {
  try {
    return new URL(href, baseUrl.href);
  } catch {
    return null;
  }
}

function normalizePathname(pathname: string): string {
  if (!pathname || pathname === '/') {
    return '/';
  }

  return pathname.replace(/\/+$/, '') || '/';
}

function isCurrentRoute(snapshot: RouteSnapshot, href: string): boolean {
  const baseUrl = getBaseUrl(snapshot);
  const targetUrl = resolveTargetUrl(href, baseUrl);

  if (!targetUrl || targetUrl.origin !== baseUrl.origin) {
    return false;
  }

  return (
    normalizePathname(targetUrl.pathname) === normalizePathname(snapshot.path)
  );
}

/**
 * NavLink is a route-aware anchor for navigation bars and section lists.
 * It mirrors the current route with `aria-current="page"` and route state
 * attributes so themes can style active links consistently.
 */
export function NavLink(props: NavLinkProps): JSXElement;
export function NavLink(props: NavLinkAsChildProps): JSXElement;
export function NavLink(props: NavLinkProps | NavLinkAsChildProps) {
  const {
    asChild,
    children,
    class: className,
    href,
    rel,
    ref,
    target,
    'aria-label': ariaLabel,
    ...rest
  } = props;

  const snapshot = currentRoute();
  const isCurrent = isCurrentRoute(snapshot, href);
  const ariaCurrent = isCurrent ? ('page' as const) : undefined;

  const hostProps = mergeProps(rest, {
    href,
    class: className as string | undefined,
    rel: rel as string | undefined,
    target: target as string | undefined,
    ref,
    'aria-label': ariaLabel as string | undefined,
  });

  const finalProps = {
    ...hostProps,
    'aria-current': ariaCurrent,
    'data-slot': 'nav-link',
    'data-nav-link': 'true',
    'data-state': isCurrent ? 'active' : 'inactive',
  };

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSXElement} />;
  }

  return <Link {...finalProps}>{children}</Link>;
}

