import API from '@/config/api';

export interface SubmitFeesPayload {
  studentId: string;
  amount: number;
  month: string;
  receiptNumber: string;
}

export interface FeesHistoryItem {
  _id: string;
  amount: number;
  status: 'Paid' | 'Pending';
  month: string;
  paymentDate?: string;
  receiptNumber?: string;
}

export const feesService = {
  submit: async (payload: SubmitFeesPayload) => {
    const response = await API.post('/fees/submit', payload);
    return response.data;
  },
  getStatus: async (studentId: string): Promise<FeesHistoryItem[]> => {
    const response = await API.get(`/fees/status/${studentId}`);
    return response.data;
  }
};
