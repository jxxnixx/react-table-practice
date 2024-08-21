import React from 'react';
import MaterialTable from '@/component/materialTable';
import { staticData } from '@/component/data';

const page = () => {
  return <MaterialTable data={staticData} />;
};

export default page;
