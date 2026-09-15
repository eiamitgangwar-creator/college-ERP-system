'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import Navbar from '../../components/Navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* sidebar */}
      <Sidebar />
      <div className="flex-grow pl-64 flex flex-col">
        <Navbar />
        <main className="p-8 flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
}
