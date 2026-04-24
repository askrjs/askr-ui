import { Flex } from '../flex';
import type { StackAsChildProps, StackDivProps } from './stack.types';

export function Stack(props: StackDivProps): JSX.Element;
export function Stack(props: StackAsChildProps): JSX.Element;
export function Stack(props: StackDivProps | StackAsChildProps) {
  const { children, ...rest } = props;
  return (
    <Flex
      {...(rest as Record<string, unknown>)}
      data-slot="stack"
      direction="column"
    >
      {children}
    </Flex>
  );
}
