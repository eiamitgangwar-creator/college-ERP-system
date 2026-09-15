'use client';

import React, { useState, useEffect } from 'react';
import API from '@/config/api';
import { attendanceService, AttendanceReportResponse } from './attendance.services';

// college master data structure (to sink department and courses)
const collegeStructure: Record<string, string[]> = {
  'Department of Humanities': ['B.Sc', 'BA', 'MA'],
  'Department of Engineering': ['B.Tech (Computer Science)', 'B.Tech (Mechanical)', 'B.Tech (Civil)', 'M.Tech'],
  'Department of Management': ['MBA', 'PGDM']
};

const semestersList = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];

export default function AttendanceDashboard() {
  const [selectedDept, setSelectedDept] = useState('Department of Engineering');
  const [selectedCourse, setSelectedCourse] = useState('B.Tech (Computer Science)');
  const [selectedSemester, setSelectedSemester] = useState('1st Sem');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [sheetRecords, setSheetRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userRole, setUserRole] = useState('');

  const [reportData, setReportData] = useState<AttendanceReportResponse | null>(null);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUserRole(JSON.parse(storedUser).role);
  }, []);

  const handleDeptChange = (dept: string) => {
    setSelectedDept(dept);
    const availableCourses = collegeStructure[dept] || [];
    setSelectedCourse(availableCourses[0] || '');
  };

  // 🔍 1. Load Student Roll Sheet matching College Metrics cleanly
  const handleLoadSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return alert('Please enter Subject / Lecture name!');

    setLoading(true);
    setSheetRecords([]); // clean old record
    try {
      const allStudentsRes = await API.get('/students/all');
      
      // 
      const studentsData = Array.isArray(allStudentsRes.data) ? allStudentsRes.data : [];

      const filtered = studentsData.filter(
        (s: any) => 
          s.department === selectedDept &&
          s.course === selectedCourse &&
          s.semester === selectedSemester
      );

      if (filtered.length === 0) {
        alert('No students found registered in this Department/Course/Semester! ⏳\n Please go to the "Students" page first to add students to this batch.');
        setLoading(false);
        return;
      }

      const initialSheet = filtered.map((s: any) => ({
        studentId: s._id || '',
        name: s.name,
        rollNumber: s.rollNumber,
        status: 'Present',
        isSaved: false,
      }));

      setSheetRecords(initialSheet);
    } catch (err) {
      console.error("Frontend Fetch Roll Sheet Error:", err);
      alert('Database connection error! Please ensure that student credentials are synced.');
    } finally {
      setLoading(false);
    }
  };



  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Leave') => {
    setSheetRecords(prev => prev.map(r => r.studentId === studentId ? { ...r, status, isSaved: false } : r));
  };

  
  //  Submit Lecture Attendance Logs via Core Loop Routine
  const handleSaveAll = async () => {
    if (sheetRecords.length === 0) return alert('No records to sync!');
    
    setSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const record of sheetRecords) {
      if (record.isSaved) {
        successCount++; 
        continue;
      }
      try {
        
        await attendanceService.markSingle({
          studentId: record.studentId,
          status: record.status,
          date: date,
          department: selectedDept, 
          course: selectedCourse,     
          semester: selectedSemester, 
          subject: subject.trim()    
        });
        
        record.isSaved = true;
        successCount++;
      } catch (err: any) {
              console.error("Single record sync failed completely. Error details:", err.response || err);

        errorCount++;
      }
    }

    setSubmitting(false);
    alert(`Campus Ledger Synced! 🎉\nLecture Logs Saved: ${successCount}\nFailed: ${errorCount}`);
    
    
    setSheetRecords([...sheetRecords]);
  };


  const handleViewReport = async (studentId: string, name: string) => {
    setSelectedStudentName(name);
    setLoadingReport(true);
    setIsReportOpen(true);
    try {
      const res = await attendanceService.getReport(studentId);
      setReportData(res);
    } catch (err) {
      alert('Could not fetch report card statements.');
      setIsReportOpen(false);
    } finally {
      setLoadingReport(false);
    }
  };

  const canMark = userRole === 'admin' || userRole === 'teacher';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Lecture Attendance Desk</h2>
        <p className="text-gray-500 text-sm">Select the department, semester, and subject to submit the live lecture log</p>
      </div>

            {/* College Metric Filters Row Form Container */}
      <form onSubmit={handleLoadSheet} className="bg-white p-5 rounded-2xl border shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end text-xs">
        <div>
          <label className="block font-bold text-gray-600 mb-1">College Department</label>
          <select value={selectedDept} onChange={e => handleDeptChange(e.target.value)} className="w-full p-2.5 border rounded-lg bg-white outline-none">
            {Object.keys(collegeStructure).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-bold text-gray-600 mb-1">Course / Branch</label>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full p-2.5 border rounded-lg bg-white outline-none">
            {(collegeStructure[selectedDept] || []).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-bold text-gray-600 mb-1">Semester</label>
          <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="w-full p-2.5 border rounded-lg bg-white outline-none">
            {semestersList.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-bold text-gray-600 mb-1">Subject / Lecture Title</label>
          <input type="text" placeholder="e.g. Data Structures" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-2.5 border rounded-lg text-xs outline-none" required />
        </div>
        <div>
          <label className="block font-bold text-gray-600 mb-1">Attendance Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2.5 border rounded-lg text-xs outline-none" required />
        </div>
        <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-lg text-xs transition shadow-md shadow-blue-600/10">
            Generate Attendance Roll Sheet
          </button>
        </div>
      </form>

      {/* Campus Roll Sheet Data Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading lecture attendance sheet...</div>
        ) : sheetRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">Please enter the Department, Course, Semester, and Lecture Topic above, then click on the 'Generate' button।</div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
                    <th className="p-4 px-6">Univ Roll No</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4 text-center">Mark Lecture Status</th>
                    <th className="p-4 text-center px-6">Academic Report</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                  {sheetRecords.map((rec) => (
                    <tr key={rec.studentId} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 px-6 font-mono font-bold text-gray-900">{rec.rollNumber}</td>
                      <td className="p-4 flex items-center space-x-2">
                        <span className="font-medium">{rec.name}</span>
                        {rec.isSaved && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-bold">Synced</span>}
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex space-x-1 bg-gray-100 p-1 rounded-xl border text-xs font-bold">
                          {(['Present', 'Absent', 'Leave'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              disabled={!canMark}
                              onClick={() => handleStatusChange(rec.studentId, st)}
                              className={`px-3 py-1.5 rounded-lg transition-all ${
                                rec.status === st 
                                  ? st === 'Present' ? 'bg-green-600 text-white' : st === 'Absent' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center px-6">
                        <button
                          type="button"
                          onClick={() => handleViewReport(rec.studentId, rec.name)}
                          className="text-blue-600 hover:text-blue-800 font-medium underline transition"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {canMark && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-green-600/10 transition disabled:opacity-50"
                >
                  {submitting ? 'Syncing to collegeDB...' : 'Save Lecture Logs to Database'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

            {/*  Historical Attendance Summary Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-gray-900 text-lg">{selectedStudentName}'s Summary</h3>
              <button type="button" onClick={() => setIsReportOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>

            {loadingReport ? (
              <div className="py-8 text-center text-gray-500 text-sm">Fetching Report Card...</div>
            ) : reportData ? (
              <div className="space-y-4">
                {/* Stats Counters */}
                <div className="grid grid-cols-2 gap-3 text-center text-xs font-semibold">
                  <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-xl text-blue-900">Total Logs: {reportData.totalDays} Lectures</div>
                  <div className="bg-green-50 border border-green-100 p-2.5 rounded-xl text-green-900">Present ✅: {reportData.presentDays}</div>
                  <div className="bg-red-50 border border-red-100 p-2.5 rounded-xl text-red-900">Absent ❌: {reportData.absentDays}</div>
                  <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-xl text-amber-900">Leave 📝: {reportData.leaveDays}</div>
                </div>

                {/* live log  */}
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detailed Log History</h4>
                  <div className="divide-y border rounded-xl overflow-hidden max-h-56 overflow-y-auto text-xs">
                    {reportData.history.length === 0 ? (
                      <p className="p-3 text-center text-gray-400">No logs found in new database.</p>
                    ) : (
                      reportData.history.map((h: any) => (
                        <div key={h._id} className="p-3 flex justify-between items-center hover:bg-gray-50 transition">
                          <div className="space-y-1">
                            {/* render lecture date */}
                            <p className="font-bold text-gray-800">
                              {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            <p className="text-[11px] text-gray-500 font-medium">
                              Subject: <span className="text-gray-700 font-bold">{h.subject || 'N/A'}</span>
                            </p>
                            {/* who marked  */}
                            <div className="text-[10px] text-slate-400 space-y-0.5">
                              <p>By: <span className="text-blue-600 font-semibold">{h.markedBy?.name || 'System / Admin'}</span> ({h.markedBy?.role || 'staff'})</p>
                              <p>Time: <span className="text-gray-500 font-mono font-medium">{new Date(h.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span></p>
                            </div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            h.status === 'Present' ? 'bg-green-100 text-green-700' : h.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>{h.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-center text-red-500">Failed to render data structure.</p>
            )}
            <div className="flex justify-end pt-4 border-t mt-4">
              <button 
                type="button" 
                onClick={() => setIsReportOpen(false)} 
                className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

