'use client';

import React, { useEffect, useState } from 'react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  // logout redirectin logic
  const handleLogout = () => {
    localStorage.clear(); // clean token and user data
    
    // send user to login gateway(/) 
    window.location.href = '/'; 
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-800">
        Welcome, <span className="text-blue-600">{user?.name || 'User'}</span>
      </h1>
      <div className="flex items-center space-x-4">
        {user?.role && (
          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase border border-blue-200">
            {user.role}
          </span>
        )}
        <button 
          onClick={handleLogout} 
          className="text-gray-600 hover:text-red-600 hover:border-red-600 text-sm font-medium border border-gray-300 px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
