import API from '@/config/api';

export interface TeacherData {
  _id?: string;
  name: string;
  email: string;
  subject: string; 
  phone: string;
  department: string;  
  designation: string; 
}

export const teacherService = {
  getAll: async (): Promise<TeacherData[]> => {
    const res = await API.get('/teachers/all');
    return res.data;
  },
  create: async (data: TeacherData) => {
    return (await API.post('/teachers/add', data)).data;
  },
  update: async (id: string, data: Partial<TeacherData>) => {
    return (await API.put(`/teachers/${id}`, data)).data;
  },
  delete: async (id: string) => {
    return (await API.delete(`/teachers/${id}`)).data;
  }
};
