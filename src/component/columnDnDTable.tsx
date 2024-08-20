"use client";

import React, { CSSProperties } from "react";
import {
  Cell,
  ColumnDef,
  Header,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PushAlert } from "./type";

const DraggableTableHeader = ({
  header,
}: {
  header: Header<PushAlert, unknown>;
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <th colSpan={header.colSpan} ref={setNodeRef} style={style}>
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
      <button {...attributes} {...listeners}>
        🟰
      </button>
    </th>
  );
};

const DragAlongCell = ({ cell }: { cell: Cell<PushAlert, unknown> }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <td style={style} ref={setNodeRef}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
};

const ColumnDnDTable = ({ data }: { data: PushAlert[] }) => {
  const columns = React.useMemo<ColumnDef<PushAlert>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        id: "title",
        size: 150,
      },
      {
        accessorKey: "frequency",
        header: "Frequency",
        id: "frequency",
        size: 150,
      },
      {
        accessorKey: "status",
        header: "Status",
        id: "status",
        size: 120,
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        id: "startDate",
        size: 120,
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        id: "endDate",
        size: 120,
      },
      {
        accessorKey: "sent",
        header: "Sent",
        id: "sent",
        size: 120,
      },
      {
        accessorKey: "openRatio",
        header: "Open Ratio",
        id: "openRatio",
        size: 120,
      },
      {
        accessorKey: "OS",
        header: "OS",
        id: "OS",
        size: 120,
      },
    ],
    []
  );

  const [tableData, setTableData] = React.useState<PushAlert[]>(data);

  const [columnOrder, setColumnOrder] = React.useState<string[]>(() =>
    columns.map((c) => c.id!)
  );

  const table = useReactTable({
    data: tableData,
    columns,
    filterFns: {},
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
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
      sensors={sensors}>
      <div className='p-2'>
        <div className='h-4' />
        <div className='flex flex-wrap gap-2'>
          <button onClick={() => setTableData(data)} className='border p-1'>
            Regenerate
          </button>
        </div>
        <div className='h-4' />
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}>
                  {headerGroup.headers.map((header) => (
                    <DraggableTableHeader key={header.id} header={header} />
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
                    strategy={horizontalListSortingStrategy}>
                    <DragAlongCell key={cell.id} cell={cell} />
                  </SortableContext>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
      </div>
    </DndContext>
  );
};

export default ColumnDnDTable;
