import type { Ref } from '@askrjs/askr/foundations/utilities';
import type { BoxAsChildProps, BoxProps } from '../_internal/types';

/** Avatar Loading Status. */
export type AvatarLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

/** Own props for Avatar, before merging with native element attributes. */
export type AvatarOwnProps = {
  children?: unknown;
  id?: string;
};

/** Props for Avatar. */
export type AvatarProps = BoxProps<'span', HTMLSpanElement> & AvatarOwnProps;
/** Props for the `asChild` (polymorphic) rendering of Avatar. */
export type AvatarAsChildProps = BoxAsChildProps & AvatarOwnProps;

/** Own props for Avatar Image, before merging with native element attributes. */
export type AvatarImageOwnProps = {
  src?: string;
  alt: string;
  onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
};

/** Props for Avatar Image. */
export type AvatarImageProps = Omit<
  JSX.IntrinsicElements['img'],
  'children' | 'ref' | 'onLoad' | 'onError' | 'alt' | 'src'
> &
  AvatarImageOwnProps & {
    ref?: Ref<HTMLImageElement>;
  };

/** Own props for Avatar Fallback, before merging with native element attributes. */
export type AvatarFallbackOwnProps = {
  children?: unknown;
};

/** Props for Avatar Fallback. */
export type AvatarFallbackProps = BoxProps<'span', HTMLSpanElement> &
  AvatarFallbackOwnProps;
/** Props for the `asChild` (polymorphic) rendering of Avatar Fallback. */
export type AvatarFallbackAsChildProps = BoxAsChildProps &
  AvatarFallbackOwnProps;
