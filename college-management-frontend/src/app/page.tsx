'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginDashboard from '../modules/auth/LoginDashboard';
import RegisterDashboard from '../modules/auth/RegisterDashboard';

export default function RootPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setIsLoggedIn(true);
      router.push('/dashboard');
    } else {
      setIsLoggedIn(false);
    }
  }, [router]);

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-medium text-sm tracking-wide">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading EduManage Portal...</p>
        </div>
      </div>
    );
  }

  //
  if (isLoggedIn) return null;

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden">
      
      {/* 🌌 LEFT SIDE: Premium Hero Branding & Features Info Banner */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Background Graphic elements for premium feel */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-wider">
              EduManage
            </span>
            <span className="bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              v2.0
            </span>
          </div>
        </div>

        {/* Main core marketing copy text */}
        <div className="my-auto max-w-xl relative z-10 space-y-6 py-12 md:py-0">
          <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-widest">
            Next-Gen School ERP Solution
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Manage your school ecosystem <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Smarter & Faster.
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            The cleanest and most modern platform to track your College's Attendance, Fees Ledger Statements, Student Directory, and Teacher records in real-time.
          </p>

          {/* Atomic small metrics list layout inside banner */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800/60">
            <div className="flex items-center space-x-3">
              <span className="text-xl bg-slate-800 p-2 rounded-xl border border-slate-700/50">📅</span>
              <div>
                <p className="text-xs font-bold text-white">Live Attendance</p>
                <p className="text-[11px] text-slate-500">Database Sync Grid</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xl bg-slate-800 p-2 rounded-xl border border-slate-700/50">💰</span>
              <div>
                <p className="text-xs font-bold text-white">Auto Invoicing</p>
                <p className="text-[11px] text-slate-500">System Generated ID</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info copy */}
        <div className="relative z-10 text-xs text-slate-500 border-t border-slate-800/40 pt-4 flex justify-between items-center">
          <p>&copy; {new Date().getFullYear()} EduManage Inc.</p>
          <p className="hidden sm:inline">All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT SIDE: Floating Login & Register Component Panel */}
      <div className="w-full md:w-1/2 bg-slate-50 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xl shadow-slate-100/60">
          {authView === 'login' ? (
            <div className="space-y-6">
              {/* to render th beaver */}
              <LoginDashboard />
              <div className="text-center pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setAuthView('register')} 
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold tracking-wide transition"
                >
                  New to EduManage? Create an account here &rarr;
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* to render the beaver */}
              <RegisterDashboard />
              <div className="text-center pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setAuthView('login')} 
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold tracking-wide transition"
                >
                  &larr; Already registered? Sign in instead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
