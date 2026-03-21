import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach bearer token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (data) => api.post('/api/auth/login', data);
export const register = (data) => api.post('/api/auth/register', data);

// Departments
export const getDepartments = () => api.get('/api/departments/');
export const createDepartment = (data) => api.post('/api/departments/', data);
export const updateDepartment = (id, data) => api.put(`/api/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/api/departments/${id}`);

// Staff
export const getStaff = () => api.get('/api/staff/');
export const createStaff = (data) => api.post('/api/staff/', data);
export const updateStaff = (id, data) => api.put(`/api/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/api/staff/${id}`);

// Doctors
export const getDoctors = () => api.get('/api/doctors/');
export const createDoctor = (data) => api.post('/api/doctors/', data);
export const updateDoctor = (id, data) => api.put(`/api/doctors/${id}`, data);
export const deleteDoctor = (id) => api.delete(`/api/doctors/${id}`);

// Patients
export const getPatients = () => api.get('/api/patients/');
export const createPatient = (data) => api.post('/api/patients/', data);
export const updatePatient = (id, data) => api.put(`/api/patients/${id}`, data);
export const deletePatient = (id) => api.delete(`/api/patients/${id}`);

// Appointments
export const getAppointments = () => api.get('/api/appointments/');
export const createAppointment = (data) => api.post('/api/appointments/', data);
export const updateAppointment = (id, data) => api.put(`/api/appointments/${id}`, data);
export const deleteAppointment = (id) => api.delete(`/api/appointments/${id}`);

// Consultation Billing
export const getBilling = () => api.get('/api/consultation-billing/');
export const createBilling = (data) => api.post('/api/consultation-billing/', data);
export const updateBilling = (id, data) => api.put(`/api/consultation-billing/${id}`, data);
export const deleteBilling = (id) => api.delete(`/api/consultation-billing/${id}`);

// Prescriptions
export const getPrescriptions = () => api.get('/api/prescriptions/');
export const createPrescription = (data) => api.post('/api/prescriptions/', data);
export const deletePrescription = (id) => api.delete(`/api/prescriptions/${id}`);

// Medicines
export const getMedicines = () => api.get('/api/medicines/');
export const createMedicine = (data) => api.post('/api/medicines/', data);
export const updateMedicine = (id, data) => api.put(`/api/medicines/${id}`, data);
export const deleteMedicine = (id) => api.delete(`/api/medicines/${id}`);

// Lab Tests
export const getLabTests = () => api.get('/api/lab-tests/');
export const createLabTest = (data) => api.post('/api/lab-tests/', data);
export const updateLabTest = (id, data) => api.put(`/api/lab-tests/${id}`, data);
export const deleteLabTest = (id) => api.delete(`/api/lab-tests/${id}`);

// Prescribed Medicines
export const getPrescribedMedicines = () => api.get('/api/prescribed-medicines/');
export const createPrescribedMedicine = (data) => api.post('/api/prescribed-medicines/', data);
export const deletePrescribedMedicine = (id) => api.delete(`/api/prescribed-medicines/${id}`);

// Prescribed Tests
export const getPrescribedTests = () => api.get('/api/prescribed-tests/');
export const createPrescribedTest = (data) => api.post('/api/prescribed-tests/', data);
export const deletePrescribedTest = (id) => api.delete(`/api/prescribed-tests/${id}`);

export default api;
