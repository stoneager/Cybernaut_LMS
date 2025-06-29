import React from 'react';
import { FaBell } from 'react-icons/fa';

export default function Topbar({ pageTitle = "Dashboard", userName = "Student" }) {
  return (
      <div className="sticky top-0 z-30 w-full bg-white shadow-sm px-6 py-6 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-gray-800">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <FaBell className="text-xl text-gray-600 hover:text-blue-600 cursor-pointer" />
        <span className="text-sm hidden sm:inline text-gray-700">Welcome, {userName}</span>
      </div>
    </div>
  );
}
