'use client';

import {
  ColumnDef,
  ColumnOrderState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React from 'react';
import { PushAlert } from './type';

const defaultColumns: ColumnDef<PushAlert>[] = [
  {
    header: 'Alert Details',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'title',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
        header: 'Title',
      },
      {
        accessorKey: 'frequency',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
        header: 'Frequency',
      },
      {
        accessorKey: 'status',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
        header: 'Status',
      },
    ],
  },
  {
    header: 'Dates',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'startDate',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
        header: 'Start Date',
      },
      {
        accessorKey: 'endDate',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
        header: 'End Date',
      },
    ],
  },
  {
    header: 'Metrics',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'sent',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
        header: 'Sent',
      },
      {
        accessorKey: 'openRatio',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
        header: 'Open Ratio',
      },
    ],
  },
  {
    header: 'Platform',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'OS',
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
        header: 'OS',
      },
    ],
  },
];

type Props = {
  initialData: PushAlert[];
};

const ColumnOrderingTable = ({ initialData }: Props) => {
  const [data, setData] = React.useState(() => initialData);
  const [columns] = React.useState(() => [...defaultColumns]);

  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([]);

  const rerender = () => setData(() => initialData);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      columnOrder,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  const randomizeColumns = () => {
    table.setColumnOrder(
      table
        .getAllLeafColumns()
        .map((d) => d.id)
        .reverse() // Reverse to simulate shuffling
    );
  };

  return (
    <div className="p-2">
      <div className="inline-block border border-black shadow rounded">
        <div className="px-1 border-b border-black">
          <label>
            <input
              type="checkbox"
              checked={table.getIsAllColumnsVisible()}
              onChange={table.getToggleAllColumnsVisibilityHandler()}
            />{' '}
            Toggle All
          </label>
        </div>
        {table.getAllLeafColumns().map((column) => (
          <div key={column.id} className="px-1">
            <label>
              <input
                type="checkbox"
                checked={column.getIsVisible()}
                onChange={column.getToggleVisibilityHandler()}
              />
              {column.id}
            </label>
          </div>
        ))}
      </div>
      <br />
      <div className="h-4" />
      <div className="flex flex-wrap gap-2">
        <button onClick={() => rerender()} className="border p-1">
          Regenerate
        </button>
        <button onClick={() => randomizeColumns()} className="border p-1">
          Shuffle Columns
        </button>
      </div>
      <div className="h-4" />
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {/* <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </tfoot> */}
      </table>
      {/* <pre>{JSON.stringify(table.getState().columnOrder, null, 2)}</pre> */}
    </div>
  );
};

export default ColumnOrderingTable;
