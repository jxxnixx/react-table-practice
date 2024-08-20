import Link from "next/link";
import React from "react";

const Nav = () => {
  return (
    <div className='absolute bg-white h-[80px] w-screen text-black flex flex-row gap-10 justify-center items-center'>
      <Link href={"/table"}>Table</Link>
      <Link href={"/columnOrder"}>ColumnOrderTable</Link>
      <Link href={"/columnDnD"}>ColumnDnDTable</Link>
      <Link href={"/columnFilters"}>ColumnFiltersTable</Link>
      <Link href={"/fuzzyFilters"}>FuzzyFiltersTable</Link>
      <Link href={"/columnFiltersAndVisibility"}>
        ColumnFiltersAndVisibility
      </Link>
      <Link href={"/columnFiltersVisibilityAndDnD"}>
        ColumnFiltersVisibilityAndDnD
      </Link>
    </div>
  );
};

export default Nav;
