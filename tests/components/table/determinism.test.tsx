import { describe, it } from 'vite-plus/test';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../../src/components/primitives/table';
import { expectDeterministicRender } from '../../determinism';

describe('Table - Determinism', () => {
  it('should render deterministic table markup', () => {
    expectDeterministicRender(() => (
      <Table aria-label="Users">
        <TableCaption>Users</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeaderCell scope="col">Name</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ));
  });
});
