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

export function axeAsChildHosts(root: HTMLElement): void {
  mount(
    <Table asChild>
      <div>
        <TableCaption asChild>
          <p id="users-caption">Users</p>
        </TableCaption>
        <TableHead asChild>
          <div>
            <TableRow asChild>
              <div>
                <TableHeaderCell asChild>
                  <span>Name</span>
                </TableHeaderCell>
              </div>
            </TableRow>
          </div>
        </TableHead>
        <TableBody asChild>
          <div>
            <TableRow asChild>
              <div>
                <TableCell asChild>
                  <span>Alice</span>
                </TableCell>
              </div>
            </TableRow>
          </div>
        </TableBody>
      </div>
    </Table>,
    root
  );
}

export function axeAsChildDefaultCaption(root: HTMLElement): void {
  mount(
    <Table asChild>
      <div>
        <TableCaption>Users</TableCaption>
        <TableHead asChild>
          <div>
            <TableRow asChild>
              <div>
                <TableHeaderCell asChild>
                  <span>Name</span>
                </TableHeaderCell>
              </div>
            </TableRow>
          </div>
        </TableHead>
        <TableBody asChild>
          <div>
            <TableRow asChild>
              <div>
                <TableCell asChild>
                  <span>Alice</span>
                </TableCell>
              </div>
            </TableRow>
          </div>
        </TableBody>
      </div>
    </Table>,
    root
  );
}

export function axeAsChildNativeTable(root: HTMLElement): void {
  mount(
    <Table asChild>
      <table>
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
      </table>
    </Table>,
    root
  );
}
