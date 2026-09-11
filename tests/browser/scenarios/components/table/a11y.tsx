import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../../../../src/components/table';
import { mount } from '../../_mount';

export function axeSemanticTable(root: HTMLElement): void {
  mount(
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
    </Table>,
    root
  );
}
