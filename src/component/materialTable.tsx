'use client';

import React, { useMemo, useState } from 'react';
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
import { arrayMove } from '@dnd-kit/sortable';

import {
  MaterialReactTable,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';

import { PushAlert } from './type';

type MaterialTableProps = {
  data: PushAlert[];
};

const MaterialTable: React.FC<MaterialTableProps> = ({ data }) => {
  const uniqueFrequencies = Array.from(
    new Set(data.map((item) => item.frequency))
  );
  const uniqueStatuses = Array.from(new Set(data.map((item) => item.status)));
  const uniqueOS = Array.from(new Set(data.flatMap((item) => item.OS)));

  const columns = useMemo<MRT_ColumnDef<PushAlert, any>[]>(
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
        accessorFn: (row) => row.OS.join(' '), // 변환 로직 추가
        header: 'OS',
        meta: {
          filterVariant: 'checkbox',
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

  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!)
  );

  const table = useMaterialReactTable({
    data,
    columns,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
  });

  const filteredRowCount = table.getFilteredRowModel().rows.length;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
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
        <MaterialReactTable columns={columns} data={data} />

        <div className="p-4">
          <span>Filtered Rows: {filteredRowCount}</span>
        </div>
      </div>
    </DndContext>
  );
};

export default MaterialTable;
