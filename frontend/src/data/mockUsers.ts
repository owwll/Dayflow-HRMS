import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    email: 'admin@dayflow.com',
    password: 'admin123',
    firstName: 'Priya',
    lastName: 'Sharma',
    role: 'admin',
    department: 'Human Resources',
    position: 'HR Manager',
    phone: '+91 98765 43210',
    address: '123, MG Road, Bangalore, Karnataka - 560001',
    joinDate: '2022-01-15',
    isVerified: true,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    email: 'rahul@dayflow.com',
    password: 'employee123',
    firstName: 'Rahul',
    lastName: 'Kumar',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Developer',
    phone: '+91 98765 43211',
    address: '456, Koramangala, Bangalore, Karnataka - 560095',
    joinDate: '2023-03-20',
    isVerified: true,
  },
  {
    id: '3',
    employeeId: 'EMP003',
    email: 'ananya@dayflow.com',
    password: 'employee123',
    firstName: 'Ananya',
    lastName: 'Patel',
    role: 'employee',
    department: 'Marketing',
    position: 'Marketing Specialist',
    phone: '+91 98765 43212',
    address: '789, HSR Layout, Bangalore, Karnataka - 560102',
    joinDate: '2023-06-10',
    isVerified: true,
  },
];

export const departments = [
  'Human Resources',
  'Engineering',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
];

export const positions = [
  'Manager',
  'Senior Developer',
  'Software Developer',
  'Junior Developer',
  'Marketing Specialist',
  'Sales Representative',
  'Accountant',
  'HR Officer',
];
