import type { BoxAsChildProps, BoxProps } from '../../_internal/types';

export type NavLinkOwnProps = {
  href: string;
};

export type NavLinkSharedProps = Omit<
  BoxProps<'a', HTMLAnchorElement>,
  'aria-current'
> &
  NavLinkOwnProps;

export type NavLinkProps = NavLinkSharedProps;

export type NavLinkAsChildProps = BoxAsChildProps & NavLinkSharedProps;
