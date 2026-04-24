import { describe, it } from 'vite-plus/test';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../../../src/components/primitives/avatar';
import { expectDeterministicRender } from '../../determinism';

describe('Avatar - Determinism', () => {
  it('should render deterministic avatar markup', () => {
    expectDeterministicRender(() => (
      <Avatar>
        <AvatarImage key="image" src="/avatar.png" alt="Jane Doe" />
        <AvatarFallback key="fallback">JD</AvatarFallback>
      </Avatar>
    ));
  });
});
