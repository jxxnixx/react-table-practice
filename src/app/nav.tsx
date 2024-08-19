import Link from 'next/link';
import React from 'react';

const Nav = () => {
  return (
    <div className="absolute bg-white h-[80px] w-screen text-black flex flex-row gap-40 justify-center items-center">
      <Link href={'/columnOrder'}>ColumnOrderTable</Link>
      <Link href={'/columnDnD'}>ColumnDnDTable</Link>
    </div>
  );
};

export default Nav;
