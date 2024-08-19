import ColumnDnDTable from '@/component/columnDnDTable';
import { staticData } from '@/component/data';
import React from 'react';

const page = () => {
  return <ColumnDnDTable data={staticData} />;
};

export default page;
