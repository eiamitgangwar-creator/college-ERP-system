import API from '@/config/api';

interface AuthResponse {
  message: string;
  token?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
    studentId?: string;
    studentClass?: string;
    section?: string;
    rollNumber?: string;
    guardianName?: string;
    guardianPhone?: string;
    feesPaid?: boolean;
  };
}

export const authService = {
  login: async (data: any): Promise<AuthResponse> => {
    const response = await API.post('/auth/login', data);
    return response.data;
  },
  register: async (data: any): Promise<AuthResponse> => {
    const response = await API.post('/auth/register', data);
    return response.data;
  }
};
