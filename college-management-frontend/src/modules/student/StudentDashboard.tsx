'use client';

import React, { useEffect, useState } from 'react';
import { studentService, StudentData } from './student.services';
import API from '@/config/api';

// college master data structure (Hierarchical Data)
const collegeStructure: Record<string, string[]> = {
  'Department of Humanities': ['B.Sc', 'BA', 'MA'],
  'Department of Engineering': ['B.Tech (Computer Science)', 'B.Tech (Mechanical)', 'B.Tech (Civil)', 'M.Tech'],
  'Department of Management': ['MBA', 'PGDM']
};

const semestersList = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];

export default function StudentDashboard() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  
  // filter state
  const [filterDept, setFilterDept] = useState('');
  const [filterSem, setFilterSem] = useState('');

  // modal control state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

    const [gradingMode, setGradingMode] = useState(false); // ग्रेडिंग मोड ऑन/ऑफ करने के लिए
  const [assessmentMeta, setAssessmentForm] = useState({
    type: 'Assignment', title: 'Assignment 1', subject: 'Data Structures', maxMarks: '100'
  });
  const [marksState, setMarksState] = useState<Record<string, string>>({}); // { studentId: obtainedMarks }
  const [submittingGrades, setSubmittingGrades] = useState(false);

  // college based formstate
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    rollNumber: '',
    department: 'Department of Humanities',
    course: 'B.Sc',
    semester: '1st Sem',
    guardianName: '',
    guardianPhone: ''
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      setStudents(data);
      setFilteredStudents(data);
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

  
  const handleDepartmentChange = (dept: string) => {
    const availableCourses = collegeStructure[dept] || [];
    setFormData({
      ...formData,
      department: dept,
      course: availableCourses[0] || ''
    });
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    let result = [...students];
    if (filterDept) result = result.filter(s => s.department === filterDept);
    if (filterSem) result = result.filter(s => s.semester === filterSem);
    setFilteredStudents(result);
  };

  const openModal = (student: any = null) => {
    if (student && student._id) {
      setEditingId(student._id);
      setFormData(student);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        rollNumber: '',
        department: 'Department of Humanities',
        course: 'B.Sc',
        semester: '1st Sem',
        guardianName: '',
        guardianPhone: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await studentService.update(editingId, formData);
        alert('Student record updated successfully! 📝');
      } else {
        await studentService.create(formData);
        alert('Student registered inside collegeDB! 🎉');
      }
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this student? 🗑️')) {
      try {
        await studentService.delete(id);
        alert('Record deleted!');
        fetchStudents();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };
  
  const handleBulkGradesSubmit = async () => {
    if (!assessmentMeta.subject.trim() || !assessmentMeta.title.trim()) {
      return alert("Please fill Subject and Title before syncing!");
    }

    setSubmittingGrades(true);
    let count = 0;
    try {
      for (const student of filteredStudents) {
        const studentId = student._id;
        const obtained = marksState[studentId || ''];
        
        if (studentId && obtained && obtained.trim() !== '') {
          await API.post('/grades/submit', {
            studentId,
            type: assessmentMeta.type,
            title: assessmentMeta.title,
            subject: assessmentMeta.subject,
            maxMarks: Number(assessmentMeta.maxMarks || 100),
            obtainedMarks: Number(obtained),
            department: student.department,
            course: (student as any).course || 'General',
            semester: student.semester
          });
          count++;
        }
      }
      alert(`Successfully locked performance marks for ${count} students inside collegeDB! 📊`);
      setGradingMode(false);
      setMarksState({});
    } catch (err) {
      alert("Error locking grade matrices.");
    } finally {
      setSubmittingGrades(false);
    }
  };

  const canManageMarks = userRole === 'admin' || userRole === 'teacher';
  const isAdmin = userRole === 'admin';

    return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Campus Student Directory</h2>
          <p className="text-gray-500 text-sm">Grading and management bench of students based on department, semester, and courses</p>
        </div>
        <div className="space-x-3">
          {canManageMarks && (
            <button 
              onClick={() => setGradingMode(!gradingMode)} 
              className={`font-semibold px-5 py-2.5 rounded-xl shadow-md transition ${
                gradingMode ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'
              }`}
            >
              {gradingMode ? '✕ Cancel Grading Mode' : '📊 Open Grading Mode'}
            </button>
          )}
          {isAdmin && (
            <button onClick={() => openModal()} className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition hover:bg-blue-700">
              + Add New Student
            </button>
          )}
        </div>
      </div>

      {/*  GRADING META MANAGER CONTROL  */}
      {gradingMode && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">Assessment Type</label>
            <select value={assessmentMeta.type} onChange={e => setAssessmentForm({...assessmentMeta, type: e.target.value})} className="w-full p-2 border rounded-lg bg-white outline-none">
              <option value="Assignment">Assignment</option>
              <option value="Test">Test / Mid-Sem</option>
              <option value="Exam">End-Sem Exam</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Assessment Title</label>
            <input type="text" value={assessmentMeta.title} onChange={e => setAssessmentForm({...assessmentMeta, title: e.target.value})} className="w-full p-2 border rounded-lg outline-none" placeholder="e.g. Lab Assignment 1" />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Subject Name</label>
            <input type="text" value={assessmentMeta.subject} onChange={e => setAssessmentForm({...assessmentMeta, subject: e.target.value})} className="w-full p-2 border rounded-lg outline-none" placeholder="e.g. Data Structures" />
          </div>
          <div>
            <label className="block font-bold text-gray-700 mb-1">Max Marks</label>
            <input type="number" value={assessmentMeta.maxMarks} onChange={e => setAssessmentForm({...assessmentMeta, maxMarks: e.target.value})} className="w-full p-2 border rounded-lg outline-none" />
          </div>
        </div>
      )}

      {/* Filter Row */}      
      <form onSubmit={handleApplyFilter} className="bg-white p-4 rounded-2xl border shadow-sm flex flex-wrap gap-4 items-end text-sm">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Filter by Department</label>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border px-3 py-2 rounded-lg bg-white outline-none">
            <option value="">All Departments</option>
            {Object.keys(collegeStructure).map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Filter by Semester</label>
          <select value={filterSem} onChange={e => setFilterSem(e.target.value)} className="border px-3 py-2 rounded-lg bg-white outline-none">
            <option value="">All Semesters</option>
            {semestersList.map(sem => <option key={sem} value={sem}>{sem}</option>)}
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold">Apply Filter</button>
        <button type="button" onClick={() => { setFilterDept(''); setFilterSem(''); setFilteredStudents(students); }} className="bg-gray-100 px-5 py-2 rounded-lg font-semibold text-gray-600">Clear</button>
      </form>

      {/* Student List Grid Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-400">Loading Student Ledger...</p>
        ) : filteredStudents.length === 0 ? (
          <p className="p-8 text-center text-gray-400">No students registered under selected metrics.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="p-4 px-6">Roll No</th>
                  <th className="p-4">Student Details</th>
                  <th className="p-4">Academic Branch</th>
                  {gradingMode ? (
                    <th className="p-4 text-center w-48 bg-indigo-50/50">Marks Obtained</th>
                  ) : (
                    <th className="p-4">Guardian Contact</th>
                  )}
                  {isAdmin && !gradingMode && <th className="p-4 text-right px-6">Actions</th>}
                </tr>
              </thead>
              <tbody className="text-sm divide-y text-gray-700">
                {filteredStudents.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 px-6 font-mono font-bold text-gray-900">{s.rollNumber}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-400">{s.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-blue-600 text-xs uppercase">{s.department}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{(s as any).course || 'General'} | {s.semester}</div>
                    </td>
                    
                    {/*  LIVE INTERACTIVE EXCEL GRID GRADING INPUTS */}
                    {gradingMode ? (
                      <td className="p-4 text-center bg-indigo-50/20">
                        <div className="inline-flex items-center space-x-2">
                          <input 
                            type="number" 
                            placeholder="0"
                            value={marksState[s._id || ''] || ''}
                            onChange={e => setMarksState({ ...marksState, [s._id || '']: e.target.value })}
                            className="w-20 p-1.5 border rounded-lg text-center font-bold text-gray-950 focus:border-indigo-500 outline-none"
                          />
                          <span className="text-gray-400 font-bold">/ {assessmentMeta.maxMarks}</span>
                        </div>
                      </td>
                    ) : (
                      <td className="p-4">
                        <div className="font-medium">{s.guardianName}</div>
                        <div className="text-xs text-gray-400">{s.guardianPhone}</div>
                      </td>
                    )}

                    {isAdmin && !gradingMode && (
                      <td className="p-4 text-right px-6">
                        <div className="flex items-center justify-end space-x-3">
                          <button type="button" onClick={() => openModal(s)} className="text-blue-600 hover:text-blue-800 font-medium text-xs transition">Edit</button>
                          <button type="button" onClick={() => s._id && handleDelete(s._id)} className="text-red-600 hover:text-red-800 font-medium text-xs transition">Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/*  SYNC BATCH GRADES BUTTON BAR */}
        {gradingMode && filteredStudents.length > 0 && (
          <div className="p-4 bg-gray-50 border-t flex justify-end">
            <button
              type="button"
              onClick={handleBulkGradesSubmit}
              disabled={submittingGrades}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {submittingGrades ? 'Locking Marks in collegeDB...' : '🔒 Lock & Sync All Grades to Database'}
            </button>
          </div>
        )}
      </div>

      {/*  Add / Edit Student Dependent Dropdown Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Student Campus Profile 📝' : 'Enroll New Scholar 🎉'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Student Full Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Official Email Address</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" placeholder="john.doe@college.edu" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">University Roll Number</label>
                  <input type="text" required disabled={!!editingId} value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none disabled:bg-gray-50" placeholder="e.g. 26010045" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Semester</label>
                  <select value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full p-2.5 border rounded-lg bg-white outline-none">
                    {semestersList.map(sem => <option key={sem} value={sem}>{sem}</option>)}
                  </select>
                </div>
              </div>

                            {/* 🏢 Dynamic Dependent Select Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">College Department</label>
                  <select 
                    value={formData.department} 
                    onChange={e => handleDepartmentChange(e.target.value)} 
                    className="w-full p-2.5 border rounded-lg bg-white outline-none font-medium"
                  >
                    {Object.keys(collegeStructure).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Available Course/Branch</label>
                  <select 
                    value={formData.course} 
                    onChange={e => setFormData({...formData, course: e.target.value})} 
                    className="w-full p-2.5 border rounded-lg bg-white outline-none font-medium"
                  >
                    {(collegeStructure[formData.department] || []).map(crs => (
                      <option key={crs} value={crs}>{crs}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Guardian Name</label>
                  <input type="text" required value={formData.guardianName} onChange={e => setFormData({...formData, guardianName: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" placeholder="Father / Mother Name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Guardian Phone Contact</label>
                  <input type="text" required value={formData.guardianPhone} onChange={e => setFormData({...formData, guardianPhone: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none" placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2 border rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition"
                >
                  {editingId ? 'Save Profile Changes' : 'Admit Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
