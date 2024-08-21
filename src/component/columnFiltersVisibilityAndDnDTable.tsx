'use client';

import React, { CSSProperties, useEffect, useMemo, useState } from 'react';
import {
  Cell,
  ColumnDef,
  ColumnFiltersState,
  Header,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  Column,
  SortingState,
  getSortedRowModel,
} from '@tanstack/react-table';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PushAlert } from './type';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends object, TValue> {
    filterVariant?: 'text' | 'range' | 'select';
  }
}

const DraggableSortableTableHeader = ({
  header,
  uniqueFrequencies,
  uniqueStatuses,
  uniqueOS,
}: {
  header: Header<PushAlert, unknown>;
  uniqueFrequencies: string[];
  uniqueStatuses: string[];
  uniqueOS: string[];
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  // 디버깅용 로그 출력
  console.log('attributes:', attributes);
  console.log('listeners:', listeners);
  console.log('isDragging:', isDragging);

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <th
      colSpan={header.colSpan}
      ref={setNodeRef} // 전체 헤더 셀을 드래그 가능하게 만듭니다.
      style={style}
      className="px-4 py-2 border"
    >
      <button {...attributes} {...listeners}>
        🟰
      </button>
      {header.isPlaceholder ? null : (
        <>
          <div
            className={
              header.column.getCanSort() ? 'cursor-pointer select-none' : ''
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
            {flexRender(header.column.columnDef.header, header.getContext())}
            {{
              asc: ' 🔼',
              desc: ' 🔽',
            }[header.column.getIsSorted() as string] ?? null}
          </div>
          {header.column.getCanFilter() && (
            <div>
              <Filter
                column={header.column}
                uniqueFrequencies={uniqueFrequencies}
                uniqueStatuses={uniqueStatuses}
                uniqueOS={uniqueOS}
              />
            </div>
          )}
        </>
      )}
    </th>
  );
};

const DragAlongCell = ({ cell }: { cell: Cell<PushAlert, unknown> }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: 'width transform 0.2s ease-in-out',
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <td style={style} ref={setNodeRef}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
};

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
        placeholder={'Min'}
        className="w-12 border shadow rounded"
      />
      <DebouncedInput
        type="number"
        value={(columnFilterValue as [number, number])?.[1] ?? ''}
        onChange={(value) =>
          column.setFilterValue((old: [number, number]) => [old?.[0], value])
        }
        placeholder={'Max'}
        className="w-12 border shadow rounded"
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
      placeholder={'Search...'}
      className="w-full border shadow rounded"
    />
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue); // 입력이 발생할 때마다 즉시 onChange 호출
  };

  return <input {...props} value={value} onChange={handleChange} />;
}

type ColumnFiltersAndVisibilityTableProps = {
  data: PushAlert[];
};

const ColumnFiltersAndVisibilityTable: React.FC<
  ColumnFiltersAndVisibilityTableProps
> = ({ data }) => {
  // Extract unique values for select options
  const uniqueFrequencies = Array.from(
    new Set(data.map((item) => item.frequency))
  );
  const uniqueStatuses = Array.from(new Set(data.map((item) => item.status)));
  const uniqueOS = Array.from(new Set(data.map((item) => item.OS)));

  const columns = useMemo<ColumnDef<PushAlert, any>[]>(
    () => [
      {
        id: 'title',
        accessorKey: 'title',
        header: 'Title',
        meta: {
          filterVariant: 'text',
        },
        size: 150,
      },
      {
        id: 'frequency',
        accessorKey: 'frequency',
        header: 'Frequency',
        meta: {
          filterVariant: 'select',
        },
        size: 150,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        meta: {
          filterVariant: 'select',
        },
        size: 120,
      },
      {
        id: 'startDate',
        accessorKey: 'startDate',
        header: 'Start Date',
        meta: {
          filterVariant: 'text',
        },
        size: 120,
      },
      {
        id: 'endDate',
        accessorKey: 'endDate',
        header: 'End Date',
        meta: {
          filterVariant: 'text',
        },
        size: 120,
      },
      {
        id: 'OS',
        accessorKey: 'OS',
        header: 'OS',
        meta: {
          filterVariant: 'select',
        },
        size: 120,
      },
      {
        id: 'sent',
        accessorKey: 'sent',
        header: 'Sent',
        meta: {
          filterVariant: 'range',
        },
        size: 120,
      },
      {
        id: 'openRatio',
        accessorKey: 'openRatio',
        header: 'Open Ratio',
        meta: {
          filterVariant: 'range',
        },
        size: 120,
      },
    ],
    [uniqueFrequencies, uniqueStatuses, uniqueOS]
  );

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(
    {}
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!)
  );
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    filterFns: {}, // 필수 속성으로 빈 객체라도 전달해야 함
    state: {
      columnFilters,
      columnVisibility,
      columnOrder,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  // reorder columns after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
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
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {headerGroup.headers.map((header) => (
                    <DraggableSortableTableHeader
                      key={header.id}
                      header={header}
                      uniqueFrequencies={uniqueFrequencies}
                      uniqueStatuses={uniqueStatuses}
                      uniqueOS={uniqueOS}
                    />
                  ))}
                </SortableContext>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <SortableContext
                    key={cell.id}
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    <DragAlongCell key={cell.id} cell={cell} />
                  </SortableContext>
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
    </DndContext>
  );
};

export default ColumnFiltersAndVisibilityTable;
