import { describe, it } from 'vite-plus/test';
import { expectNoAxeViolations } from '../../accessibility';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../../src/components/primitives/table';

describe('Table - Accessibility', () => {
  it('has no automated axe violations for a semantic table', async () => {
    await expectNoAxeViolations(
      <Table aria-label="Users">
        <TableCaption>Users</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeaderCell scope="col">Name</TableHeaderCell>
            <TableHeaderCell scope="col">Email</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>alice@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  });
});
