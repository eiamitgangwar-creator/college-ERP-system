import API from '@/config/api';

export interface SingleAttendancePayload {
  studentId: string;
  status: 'Present' | 'Absent' | 'Leave';
  date: string;
  department: string;
  course: string;
  semester: string;
  subject: string;
}

export interface AttendanceReportResponse {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  history: any[];
}

export const attendanceService = {
  markSingle: async (payload: SingleAttendancePayload) => {
    const response = await API.post('/attendance/mark', payload);
    return response.data;
  },
  getReport: async (studentId: string): Promise<AttendanceReportResponse> => {
    const response = await API.get(`/attendance/report/${studentId}`);
    return response.data;
  }
};
