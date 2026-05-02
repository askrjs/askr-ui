import type { BoxAsChildProps, BoxProps } from '../../_internal/types';

export type FormOwnProps = {
  children?: unknown;
};

export type FormProps = BoxProps<'form', HTMLFormElement> & FormOwnProps;

export type FormAsChildProps = BoxAsChildProps & FormOwnProps;
