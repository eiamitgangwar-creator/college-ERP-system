'use client';

import React, { useEffect, useState } from 'react';
import API from '@/config/api';
import { feesService, FeesHistoryItem } from './fees.services';

export default function FeesDashboard() {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');

  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('April'); 
  const [receiptNumber, setReceiptNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [feesHistory, setFeesHistory] = useState<FeesHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const monthsList = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/students/all');
      setStudents(res.data);
      setFilteredStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUserRole(JSON.parse(storedUser).role);
  }, []);

  const openPayModal = (student: any) => {
    setSelectedStudent(student);
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(1000 + Math.random() * 9000); 
    setReceiptNumber(`REC-${year}-${selectedMonth.substring(0, 3).toUpperCase()}-${randomDigits}`);
    setIsPayModalOpen(true);
  };

  const handlePayFees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent?._id || !amount) return;

    setSubmitting(true);
    try {
      await feesService.submit({
        studentId: selectedStudent._id,
        amount: Number(amount),
        month: selectedMonth,
        receiptNumber
      });
      alert("Fees Submitted Successfully! 💰");
      setIsPayModalOpen(false);
      setAmount('');
      fetchStudents();
    } catch (err) {
      alert("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewHistory = async (student: any) => {
    setSelectedStudent(student);
    setIsHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const data = await feesService.getStatus(student._id);
      setFeesHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setFeesHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Monthly Fees Ledger</h2>
      
      {/* Table grid content list summary */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {loading ? <p className="p-6 text-center text-gray-400">Loading Accounting Ledger...</p> : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-semibold border-b">
              <tr>
                <th className="p-4">Roll No</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {filteredStudents.map(s => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono font-bold">{s.rollNumber}</td>
                  <td className="p-4">{s.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.feesPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {s.feesPaid ? 'Paid' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button type="button" onClick={() => handleViewHistory(s)} className="text-blue-600 underline">History</button>
                    {isAdmin && <button type="button" onClick={() => openPayModal(s)} className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-lg">Collect</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Collect Fees Form Modal popup */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-sm w-full">
            <h3 className="font-bold mb-4 text-gray-900">New Payment Entry</h3>
            <form onSubmit={handlePayFees} className="space-y-4 text-sm">
              <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="w-full p-2 border rounded-md">
                {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input type="number" placeholder="Amount (INR)" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border rounded-md" />
              <input type="text" readOnly value={receiptNumber} className="w-full p-2 border bg-gray-50 font-mono font-bold text-gray-500 rounded-md" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsPayModalOpen(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded-md">Confirm</button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* Receipts History List view modal */}
            {/* Receipts History List view modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Ledger Receipts</h3>
              <button type="button" onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>

            {loadingHistory ? (
              <p className="text-center py-4 text-sm">Loading ledger logs...</p>
            ) : feesHistory.length === 0 ? (
              <p className="text-amber-600 text-center py-4 text-sm font-medium">No paid records found in database.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
                {feesHistory.map((h) => (
                  <div key={h._id} className="p-3 border rounded-xl bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-bold text-gray-800 text-sm">₹{h.amount}</p>
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{h.month}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">Receipt ID: {h.receiptNumber || 'N/A'}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-green-700 font-bold bg-green-100 px-2 py-0.5 rounded text-[10px] tracking-wide">PAID</span>
                      {/* date to submit fee */}
                      <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                        {h.paymentDate ? new Date(h.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-4 mt-4 border-t">
              <button type="button" onClick={() => setIsHistoryModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-lg text-xs font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}


      
    </div>
  );
}
