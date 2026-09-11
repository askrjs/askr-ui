import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from '../../../../../src/components/table';
import { deterministicRender } from '../../_mount';

export function tableMarkup() {
  return {
    renders: () => [
      deterministicRender('semantic table', () => (
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
      )),
    ],
  };
}
