'use client';

import React, { useEffect, useState } from 'react';
import API from '@/config/api';

export default function DashboardOverviewPage() {
  const [user, setUser] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [studentAttendance, setStudentAttendance] = useState<any>(null);
  const [studentFees, setStudentFees] = useState<any[]>([]);
    const [studentGrades, setStudentGrades] = useState<any[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  const [adminStats, setAdminStats] = useState({
    students: '0', teachers: '0', attendance: '0%', revenue: '₹0'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchDashboardMetrics(parsedUser);
    }
  }, []);

  const fetchDashboardMetrics = async (currentUser: any) => {
    try {
      setLoadingData(true);
      if (currentUser.role === 'student') {
        const targetId = currentUser.studentId || currentUser.id;
        try {
          const feesRes = await API.get(`/fees/status/${currentUser.studentId || currentUser.id}`);
          setStudentFees(Array.isArray(feesRes.data) ? feesRes.data : []);
        } catch (fErr) {
          setStudentFees([]);
        }
 //  Live College Improvements: Retrieve student's lecture-wise attendance summary and history.
        try {
          const attendanceRes = await API.get(`/attendance/report/${targetId}`);
          setStudentAttendance(attendanceRes.data);
        } catch (attErr) {
          console.error("Failed to load student attendance logs:", attErr);
          setStudentAttendance(null);
        }
          // student marks grading 
      

        try {
          const gradesRes = await API.get(`/grades/report/${targetId}`);
            setStudentGrades(Array.isArray(gradesRes.data) ? gradesRes.data : []);
            } catch (gErr) {
                setStudentGrades([]);
              }

        setStudentProfile({
          name: currentUser.name,
          email: currentUser.email,
          rollNumber: currentUser.rollNumber,
          studentClass: currentUser.studentClass,
          section: currentUser.section,
          guardianName: currentUser.guardianName,
          guardianPhone: currentUser.guardianPhone,
          feesPaid: currentUser.feesPaid
        });
      } else {
        const studentsRes = await API.get('/students/all');
        let teachersCount = '🔒 Secured';

        if (currentUser.role === 'admin') {
          const teachersRes = await API.get('/teachers/all');
          teachersCount = teachersRes.data.length.toString();
        }

        if (currentUser.role === 'teacher') {
          setTeacherProfile({
            name: currentUser.name,
            email: currentUser.email,
            subject: currentUser.subject,
            classTeacherOf: currentUser.classTeacherOf,
            phone: currentUser.phone
          });
        }

        setAdminStats({
          students: studentsRes.data.length.toString(),
          teachers: teachersCount,
          attendance: '94%',
          revenue: currentUser.role === 'admin' ? `₹${studentsRes.data.filter((s: any) => s.feesPaid).length * 15000}` : '🔒 Restricted'
        });
      }
    } catch (err) {
      console.error("Dashboard overview query failed", err);
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingData) return <div className="text-gray-400 text-sm p-6">Loading campus dashboard statement...</div>;
  if (!user) return null;
  return (
    <div className="space-y-6">
      {/* ----------------  STUDENT PORTAL VIEW ---------------- */}
      {user.role === 'student' && studentProfile && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Student Portal Dashboard</h2>
            <p className="text-gray-500 text-sm">Your Academic, Ateendance, Fees Ledger deatils</p>
          </div>
          {/*box 1 student profile*/}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
              <div className="flex items-center space-x-3 border-b pb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">🎓</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{studentProfile.name}</h3>
                  <p className="text-xs text-gray-400 font-mono">Roll No: {studentProfile.rollNumber}</p>
                </div>
              </div>
              <div className="text-sm space-y-2 text-gray-600">
                <p><strong>Class:</strong> {studentProfile.studentClass} - {studentProfile.section}</p>
                <p><strong>Email:</strong> {studentProfile.email}</p>
                <p><strong>Guardian:</strong> {studentProfile.guardianName}</p>
                <p><strong>Contact:</strong> {studentProfile.guardianPhone}</p>
              </div>
            </div>
            {/* Box 2: Attendance Card */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
              <h4 className="font-bold text-gray-800 border-b pb-3 mb-3">Attendance Report Card</h4>
              {studentAttendance ? (
                <div className="space-y-4 flex-grow flex flex-col justify-center">
                  <div className="flex items-center justify-between bg-slate-50 border p-3 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-400 font-medium">Attendance Score</p>
                      <h3 className="text-2xl font-black text-blue-600 mt-0.5">
                        {studentAttendance.totalDays > 0 
                          ? `${Math.round((studentAttendance.presentDays / studentAttendance.totalDays) * 100)}%` 
                          : '0%'}
                      </h3>
                    </div>
                    <span className="text-2xl">📅</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
                    <div className="bg-green-50 text-green-700 p-2 rounded-lg border border-green-100">
                      <div>Present</div>
                      <div className="text-sm mt-0.5">{studentAttendance.presentDays}</div>
                    </div>
                    <div className="bg-red-50 text-red-700 p-2 rounded-lg border border-red-100">
                      <div>Absent</div>
                      <div className="text-sm mt-0.5">{studentAttendance.absentDays}</div>
                    </div>
                    <div className="bg-amber-50 text-amber-700 p-2 rounded-lg border border-amber-100">
                      <div>Leave</div>
                      <div className="text-sm mt-0.5">{studentAttendance.leaveDays}</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 text-center font-medium">Total Tracked: {studentAttendance.totalDays} Lectures</p>
                </div>
              ) : (
                <p className="text-gray-400 py-8 text-center text-xs">No attendance logs registered yet.</p>
              )}
            </div>

            {/* Box 3: Fees Statement */}
            <div className="bg-white p-6 rounded-2xl border shadow-sm">
              <h4 className="font-bold text-gray-800 border-b pb-3 mb-3">Fees Ledger Statement</h4>
              <div className="space-y-2 max-h-44 overflow-y-auto text-xs">
                {studentFees.length === 0 ? (
                  <p className="text-gray-400 py-8 text-center">No payment receipts found.</p>
                ) : (
                  studentFees.map((fee) => (
                    <div key={fee._id} className="p-3 bg-gray-50 border rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-gray-800">₹{fee.amount} ({fee.month})</p>
                        <p className="text-[10px] text-gray-400 font-mono">Receipt: {fee.receiptNumber}</p>
                      </div>
                      <span className="text-[10px] text-gray-400">{new Date(fee.paymentDate).toLocaleDateString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/*  3. Student Academic Progress Marks Table */}
          {studentGrades.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mt-6">
              <div className="p-4 border-b bg-gray-50/50 flex justify-between items-center">
                <h4 className="font-bold text-gray-800 text-sm">Academic Marks & Progress Sheets</h4>
                <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100">Live collegeDB Logs</span>
              </div>
              <div className="max-h-52 overflow-y-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold border-b uppercase sticky top-0">
                    <tr>
                      <th className="p-3 px-6">Assessment Type</th>
                      <th className="p-3">Title</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3 text-center">Marks Obtained</th>
                      <th className="p-3 text-right px-6">Evaluated By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {studentGrades.map((g: any) => (
                      <tr key={g._id} className="hover:bg-gray-50/50">
                        <td className="p-3 px-6">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            g.type === 'Assignment' ? 'bg-indigo-50 text-indigo-700' : 'bg-rose-50 text-red-700'
                          }`}>{g.type}</span>
                        </td>
                        <td className="p-3 font-medium text-gray-900">{g.title}</td>
                        <td className="p-3 text-gray-500 font-medium">{g.subject}</td>
                        <td className="p-3 text-center">
                          <span className="font-bold text-gray-900 text-sm">{g.obtainedMarks}</span> / <span className="text-gray-400">{g.maxMarks}</span>
                        </td>
                        <td className="p-3 text-right px-6 text-gray-400 font-medium">{g.markedBy?.name || 'Faculty'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------  TEACHER PORTAL VIEW ---------------- */}
      {user.role === 'teacher' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Teacher Portal Dashboard</h2>
            <p className="text-gray-500 text-sm">Your class status and personal details</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {teacherProfile && (
              <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
                <div className="flex items-center space-x-3 border-b pb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl">👨‍🏫</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{teacherProfile.name}</h3>
                    <p className="text-xs text-purple-600 font-semibold uppercase">{user.role}</p>
                  </div>
                </div>
                <div className="text-sm space-y-2 text-gray-600">
                  <p><strong>Department:</strong> {teacherProfile.subject}</p>
                  <p><strong>Designation:</strong> {teacherProfile.classTeacherOf}</p>
                  <p><strong>Email:</strong> {teacherProfile.email}</p>
                  <p><strong>Contact Phone:</strong> {teacherProfile.phone}</p>
                </div>
              </div>
            )}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center space-x-4">
                <div className="w-10 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center text-lg">🎓</div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Students</p>
                  <h4 className="text-xl font-bold text-gray-800 mt-0.5">{adminStats.students}</h4>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center space-x-4">
                <div className="w-10 h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center text-lg">📅</div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Today's Attendance</p>
                  <h4 className="text-xl font-bold text-gray-800 mt-0.5">{adminStats.attendance}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

{/* ----------------  ADMIN CONTROL VIEW ---------------- */}
      {user.role === 'admin' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Control Console</h2>
            <p className="text-gray-500 text-sm">Real-time control of all live modules of the institute</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl text-white bg-blue-500 flex items-center justify-center text-xl font-bold">🎓</div>
              <div>
                <p className="text-sm font-medium text-gray-400">Total Students</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{adminStats.students}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl text-white bg-green-500 flex items-center justify-center text-xl font-bold">👨‍🏫</div>
              <div>
                <p className="text-sm font-medium text-gray-400">Total Teachers</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{adminStats.teachers}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl text-white bg-purple-500 flex items-center justify-center text-xl font-bold">📅</div>
              <div>
                <p className="text-sm font-medium text-gray-400">Attendance</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{adminStats.attendance}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl text-white bg-amber-500 flex items-center justify-center text-xl font-bold">💰</div>
              <div>
                <p className="text-sm font-medium text-gray-400">Revenue</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{adminStats.revenue}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}