'use client';

import React, { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  MRT_Icons,
  MRT_Row,
  useMaterialReactTable,
} from 'material-react-table';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { PushAlert } from './type';

type MaterialTableProps = {
  data: PushAlert[];
};

// TODO : 포맷 함수를 이용하면, filtering이 include로 동작하지 않음.
// filter에서 아예 제외되는 듯. 기준이 표에 나와있는 형태인가? 절대적인 것 같지는 않은데 아직 좀 더 테스트 필요
const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
const formatPercentage = (num: number) => `${(num * 100).toFixed(2)}%`;

const MaterialTable: React.FC<MaterialTableProps> = ({ data }) => {
  const columns = useMemo<MRT_ColumnDef<PushAlert, any>[]>(
    () => [
      {
        id: 'id',
        accessorKey: 'id',
        header: 'ID',
        meta: {
          filterVariant: 'text',
        },
        size: 120,
      },
      {
        id: 'title',
        accessorKey: 'title',
        header: 'Title',
        meta: {
          filterVariant: 'text',
        },
        size: 150,
        // enableColumnOrdering: false,
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
        size: 60,
      },
      {
        id: 'sent',
        accessorKey: 'sent',
        // accessorFn: (row) => row.sent, // 필터링에 사용할 원본 숫자
        header: 'Sent',
        meta: {
          filterVariant: 'range',
        },
        size: 120,
        // Cell: ({ cell }) => formatNumber(cell.getValue() as number), // 포맷된 값 표시
      },
      {
        id: 'openRatio',
        accessorKey: 'openRatio',
        // accessorFn: (row) => row.openRatio, // 원본 비율값
        header: 'Open Ratio',
        meta: {
          filterVariant: 'range',
        },
        size: 120,
        // Cell: ({ cell }) => formatPercentage(cell.getValue() as number), // 포맷된 값 표시
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    data,
    columns,
    initialState: {
      showColumnFilters: true,
      // columnPinning: { left: ['id'] },
    },
    enableColumnOrdering: true,
    enableRowPinning: true,
    enableStickyHeader: true,
    rowPinningDisplayMode: 'top',
    muiFilterTextFieldProps: ({ column }) => ({
      // label: `${column.columnDef.header}`,
      placeholder: `${column.columnDef.header}`,
      sx: {
        '& .MuiInputBase-input': {
          fontSize: '13px',
        },
        '& .MuiInputBase-input::placeholder': {
          fontSize: '13px',
        },
      },
    }),
    muiTableHeadCellProps: {
      sx: {
        fontSize: '15px',
      },
    },
    icons: { PushPinIcon: PushPinOutlinedIcon },
  });

  const filteredRowCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="p-4">
      <MaterialReactTable table={table} />
      <span>Filtered Rows: {filteredRowCount}</span>
    </div>
  );
};

export default MaterialTable;
