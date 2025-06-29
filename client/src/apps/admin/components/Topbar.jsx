import React, { useState } from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import cybernaut_logo from '../assets/logo.JPG';

export default function Topbar({ pageTitle = "Dashboard", adminName = "Admin" }) {
  

  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200 z-30">

      <div className="px-6 h-20 flex justify-between items-center">
        {/* Left: Page Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{pageTitle}</h1>
        </div>

        {/* Right: Actions and User Info */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
              <FaBell className="text-xl" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
          
          {/* Welcome Message */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <span className="text-sm font-medium text-gray-700">Welcome back,</span>
            <span className="text-sm font-semibold text-blue-700">{adminName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}