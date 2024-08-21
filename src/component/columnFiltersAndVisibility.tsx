'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  Column,
  SortingFn,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import { PushAlert } from './type';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends object, TValue> {
    filterVariant?: 'text' | 'range' | 'select';
  }
}

function Filter({
  column,
  uniqueFrequencies,
  uniqueStatuses,
  uniqueOS,
}: {
  column: Column<any, unknown>;
  uniqueFrequencies: string[];
  uniqueStatuses: string[];
  uniqueOS: string[];
}) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  return filterVariant === 'range' ? (
    <div className="flex space-x-2">
      <DebouncedInput
        type="number"
        value={(columnFilterValue as [number, number])?.[0] ?? ''}
        onChange={(value) =>
          column.setFilterValue((old: [number, number]) => [value, old?.[1]])
        }
        placeholder={`Min`}
        className="w-24 border shadow rounded"
      />
      <DebouncedInput
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={(value) =>
          column.setFilterValue((old: [number, number]) => [old?.[0], value])
        }
        placeholder={`Max`}
        className="w-24 border shadow rounded"
      />
    </div>
  ) : filterVariant === 'select' ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString() ?? ''}
      className="w-full border shadow rounded"
    >
      <option value="">All</option>
      {/* 옵션은 해당 열의 데이터에서 동적으로 생성 */}
      {column.id === 'frequency' &&
        uniqueFrequencies.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      {column.id === 'status' &&
        uniqueStatuses.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      {column.id === 'OS' &&
        uniqueOS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
    </select>
  ) : (
    <DebouncedInput
      type="text"
      value={(columnFilterValue ?? '') as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      className="w-full border shadow rounded"
    />
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

type ColumnFiltersAndVisibilityTableProps = {
  data: PushAlert[];
};

const ColumnFiltersAndVisibilityTable: React.FC<
  ColumnFiltersAndVisibilityTableProps
> = ({ data }) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
    {}
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  // Extract unique values for select options
  const uniqueFrequencies = Array.from(
    new Set(data.map((item) => item.frequency))
  );
  const uniqueStatuses = Array.from(new Set(data.map((item) => item.status)));
  const uniqueOS = Array.from(new Set(data.map((item) => item.OS)));

  const columns = useMemo<ColumnDef<PushAlert, any>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        meta: {
          filterVariant: 'text',
        },
      },
      {
        accessorKey: 'frequency',
        header: 'Frequency',
        meta: {
          filterVariant: 'select',
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        meta: {
          filterVariant: 'select',
        },
      },
      {
        accessorKey: 'startDate',
        header: 'Start Date',
        meta: {
          filterVariant: 'text',
        },
      },
      {
        accessorKey: 'endDate',
        header: 'End Date',
        meta: {
          filterVariant: 'text',
        },
      },
      {
        accessorKey: 'OS',
        header: 'OS',
        meta: {
          filterVariant: 'select',
        },
      },
      {
        accessorKey: 'sent',
        header: 'Sent',
        meta: {
          filterVariant: 'range',
        },
      },
      {
        accessorKey: 'openRatio',
        header: 'Open Ratio',
        meta: {
          filterVariant: 'range',
        },
      },
    ],
    [uniqueFrequencies, uniqueStatuses, uniqueOS]
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: {}, // 필수 속성으로 빈 객체라도 전달해야 함
    state: {
      columnFilters,
      columnVisibility,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-4">
      {/* Column Visibility Controls */}
      <div className="inline-block border border-black shadow rounded mb-4">
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
              />{' '}
              {column.id}
            </label>
          </div>
        ))}
      </div>

      {/* Table with Column Filters */}
      <table className="min-w-full table-auto">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-4 py-2 border">
                  {header.isPlaceholder ? null : (
                    <>
                      <div
                        className={
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none'
                            : ''
                        }
                        onClick={header.column.getToggleSortingHandler()}
                        title={
                          header.column.getCanSort()
                            ? header.column.getNextSortingOrder() === 'asc'
                              ? 'Sort ascending'
                              : header.column.getNextSortingOrder() === 'desc'
                              ? 'Sort descending'
                              : 'Clear sort'
                            : undefined
                        }
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽',
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                      {header.column.getCanFilter() ? (
                        <div>
                          <Filter
                            column={header.column}
                            uniqueFrequencies={uniqueFrequencies}
                            uniqueStatuses={uniqueStatuses}
                            uniqueOS={uniqueOS}
                          />
                        </div>
                      ) : null}
                    </>
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
                <td key={cell.id} className="px-4 py-2 border">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ColumnFiltersAndVisibilityTable;
