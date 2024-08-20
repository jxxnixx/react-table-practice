import ColumnFiltersAndVisibilityTable from "@/component/columnFiltersAndVisibility";
import { staticData } from "@/component/data";

import React from "react";

const page = () => {
  return <ColumnFiltersAndVisibilityTable data={staticData} />;
};

export default page;
