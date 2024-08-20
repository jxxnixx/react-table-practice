import { staticData } from "@/component/data";
import FuzzyFiltersTable from "@/component/fuzzyFiltersTable";
import React from "react";

const page = () => {
  return <FuzzyFiltersTable data={staticData} />;
};

export default page;
