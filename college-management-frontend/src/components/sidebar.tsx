'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserRole(JSON.parse(storedUser).role || 'student');
      } catch (e) {
        setUserRole('student');
      }
    }
  }, []);

  const allMenuItems = [
    { name: 'Dashboard Overview', path: '/dashboard', icon: '📊', roles: ['admin', 'teacher', 'student'] },
    { name: 'Students', path: '/dashboard/student', icon: '🎓', roles: ['admin', 'teacher'] },
    { name: 'Teachers', path: '/dashboard/teacher', icon: '👨‍🏫', roles: ['admin'] },
    { name: 'Attendance', path: '/dashboard/attendance', icon: '📅', roles: ['admin', 'teacher'] },
    { name: 'Fees Management', path: '/dashboard/fees', icon: '💰', roles: ['admin'] },
  ];

  const allowedMenuItems = allMenuItems.filter((item) => 
    userRole && item.roles && item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6 border-b border-gray-800 flex items-center justify-center">
        <Link href="/" className="text-2xl font-bold text-blue-400 tracking-wider hover:text-blue-300 transition">
          EduManage
        </Link>
      </div>
      <nav className="flex-grow p-4 space-y-1 mt-4">
        {allowedMenuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-center text-xs text-gray-600 border-t border-gray-800">v1.0.0 Modular v2</div>
    </aside>
  );
}
