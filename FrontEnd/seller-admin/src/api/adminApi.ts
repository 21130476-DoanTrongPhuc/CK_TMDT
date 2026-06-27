const BASE_URL = 'http://localhost:8081/api';

function getToken() {
  return localStorage.getItem('seller_token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export interface AdminAppointment {
  id: number;
  bookingCode: string;
  services: { title: string; price: number }[];
  appointmentDate: string;
  appointmentTime: string;
  ownerName: string;
  status: string;
  notes: string;
  doctorId: number | null;
  doctorName: string | null;
  petName: string;
  petSpecies: string;
}

export interface DoctorInfo {
  id: number;
  fullName: string;
}

export interface PetServiceData {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  price: number;
  duration: number;
  category: string;
}

export const adminApi = {
  getAppointments: () => request<AdminAppointment[]>('/admin/appointments'),
  getDoctors: () => request<DoctorInfo[]>('/admin/doctors'),
  assignDoctor: (representativeId: number, doctorId: number) =>
    request<AdminAppointment[]>(`/admin/appointments/${representativeId}/assign-doctor`, {
      method: 'PUT',
      body: JSON.stringify({ doctorId }),
    }),
  unassignDoctor: (representativeId: number) =>
    request<AdminAppointment[]>(`/admin/appointments/${representativeId}/unassign-doctor`, {
      method: 'PUT',
    }),
  updateStatus: (representativeId: number, status: string) =>
    request<AdminAppointment[]>(`/admin/appointments/${representativeId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  getServices: () => request<PetServiceData[]>('/admin/services'),
  uploadServiceImage: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return fetch(`${BASE_URL}/admin/services/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: fd,
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<{ imageUrl: string }>;
    }).then((data) => data.imageUrl);
  },
  updateService: (id: number, data: Omit<PetServiceData, 'id'>) =>
    request<PetServiceData>(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  createService: (data: Omit<PetServiceData, 'id'>) =>
    request<PetServiceData>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteService: (id: number) =>
    fetch(`${BASE_URL}/admin/services/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    }),
};
