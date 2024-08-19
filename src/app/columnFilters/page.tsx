import React from 'react';
import ColumnFiltersTable from '@/component/columnFiltersTable';
import { staticData } from '@/component/data';

const page = () => {
  return <ColumnFiltersTable data={staticData} />;
};

export default page;
