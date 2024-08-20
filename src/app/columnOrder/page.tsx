import ColumnOrderingTable from "@/component/columnOrderingTable";
import React from "react";
import { staticData } from "@/component/data";

const page = () => {
  return <ColumnOrderingTable data={staticData} />;
};

export default page;
