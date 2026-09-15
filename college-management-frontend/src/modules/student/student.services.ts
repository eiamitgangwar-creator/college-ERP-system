import API from '@/config/api';

export interface StudentData {
  _id?: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  semester: string;
  guardianName: string;
  guardianPhone: string;
  feesPaid?: boolean;
}

export const studentService = {
  getAll: async (): Promise<StudentData[]> => {
    const res = await API.get('/students/all');
    return res.data;
  },
  create: async (data: StudentData) => {
    return (await API.post('/students/add', data)).data;
  },
  update: async (id: string, data: Partial<StudentData>) => {
    return (await API.put(`/students/${id}`, data)).data;
  },
  delete: async (id: string) => {
    return (await API.delete(`/students/${id}`)).data;
  }
};
