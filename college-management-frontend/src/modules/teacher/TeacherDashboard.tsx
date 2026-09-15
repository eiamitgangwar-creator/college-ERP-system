'use client';

import React, { useEffect, useState } from 'react';
import { teacherService, TeacherData } from './teacher.services';

import API from '@/config/api';


// 
const collegeDepartments = [
  'Department of Humanities',
  'Department of Engineering',
  'Department of Management'
];

// 
const academicDesignations = [
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'HOD / Dean'
];

export default function TeacherDashboard() {
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<TeacherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    subject: '',
    phone: '',
    department: 'Department of Engineering',
    designation: 'Assistant Professor'
  });
   

  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState<any>(null);
  const [gradeForm, setGradeForm] = useState({ type: 'Assignment', title: 'Assignment 1', subject: '', maxMarks: '100', obtainedMarks: '' });

  const openGradeModal = (student: any) => {
    setSelectedStudentForGrade(student);
    setIsGradeModalOpen(true);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post('/grades/submit', {
        studentId: selectedStudentForGrade._id,
        ...gradeForm,
        department: selectedStudentForGrade.department,
        course: selectedStudentForGrade.course,
        semester: selectedStudentForGrade.semester
      });
      alert("Marks Sync Complete inside collegeDB! 📊");
      setIsGradeModalOpen(false);
    } catch (err) {
      alert("Grade Entry Failed");
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAll();
      setTeachers(data);
      setFilteredTeachers(data);
    } catch (err: any) {
      console.error('Failed to load faculty logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUserRole(JSON.parse(storedUser).role);
  }, []);

  useEffect(() => {
    const results = teachers.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(results);
  }, [searchTerm, teachers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (teacher: TeacherData | null = null) => {
    if (teacher && teacher._id) {
      setEditingId(teacher._id);
      setFormData(teacher);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        subject: '',
        phone: '',
        department: 'Department of Engineering',
        designation: 'Assistant Professor'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await teacherService.update(editingId, formData);
        alert(res.message || 'Faculty logs updated! 📝');
      } else {
        const res = await teacherService.create(formData);
        alert(res.message || 'Faculty member enrolled! 👨‍🏫');
      }
      setIsModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      alert('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this faculty member? 🗑️')) {
      try {
        const res = await teacherService.delete(id);
        alert(res.message || 'Deleted successfully!');
        fetchTeachers();
      } catch (err: any) {
        alert('Delete failed');
      }
    }
  };

  const isAdmin = userRole === 'admin';

  if (!loading && !isAdmin) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl shadow-sm text-center">
        <h3 className="text-lg font-bold">Access Denied ⛔</h3>
        <p className="text-sm mt-2">Only the college administration can manage faculty logs.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Faculty Directory</h2>
          <p className="text-gray-500 text-sm">A list of all college professors and their academic departments</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition"
        >
          + Add New Faculty
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm max-w-md">
        <input
          type="text"
          placeholder="🔍 Search by name, department, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-blue-500"
        />
      </div>

           {/* Table Grid */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-gray-400">Loading Campus Directory...</p>
        ) : filteredTeachers.length === 0 ? (
          <p className="p-8 text-center text-gray-400">No faculty records found in database.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-xs text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-4 px-6">Faculty Name</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Specialization</th>
                  <th className="p-4 text-right px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 text-gray-700">
                {filteredTeachers.map((t: any) => (
                  <tr key={t._id} className="hover:bg-gray-50/70 transition">
                    <td className="p-4 px-6">
                      <div className="font-bold text-gray-900">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.email}</div>
                    </td>
                    <td className="p-4 font-semibold text-blue-600 text-xs">{t.department}</td>
                    <td className="p-4 text-gray-600 font-medium">{t.designation}</td>
                    <td className="p-4">
                      <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded text-xs font-bold uppercase">
                        {t.subject}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 px-6">
                      <button type="button" onClick={() => openModal(t)} className="text-blue-600 hover:text-blue-800 font-medium transition">Edit</button>
                      <button type="button" onClick={() => t._id && handleDelete(t._id)} className="text-red-600 hover:text-red-800 font-medium transition">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🧾 Add / Edit Faculty Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingId ? 'Edit Faculty Details 📝' : 'Register New Faculty Member 👨‍🏫'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Professor Full Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-2.5 border rounded-lg outline-none" placeholder="Dr. Nitin Patel" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Official Email Address</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-2.5 border rounded-lg outline-none" placeholder="nitin.patel@college.edu" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <select name="department" value={formData.department} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white outline-none">
                    {collegeDepartments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Designation</label>
                  <select name="designation" value={formData.designation} onChange={handleChange} className="w-full p-2.5 border rounded-lg bg-white outline-none">
                    {academicDesignations.map(desg => (
                      <option key={desg} value={desg}>{desg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Core Subject Expertise / Specialization</label>
                <input type="text" name="subject" required value={formData.subject} onChange={handleChange} className="w-full p-2.5 border rounded-lg outline-none" placeholder="e.g. Data Structures, Quantum Physics" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Mobile Number</label>
                <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="w-full p-2.5 border rounded-lg outline-none" placeholder="+91 XXXXX XXXXX" />
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
                  {editingId ? 'Save Changes' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
