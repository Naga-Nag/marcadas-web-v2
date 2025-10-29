import { vi } from 'vitest';
import type { Context } from '$lib/server/trpc/context';
import type { ContextUser } from '$lib/server/trpc/context';
import type { Departamento, Usuario, Personal, Marcada } from '$lib/types/gen';

// Mock database functions
export const mockDepartamentos = [
  {
    Deptid: 1,
    DeptName: 'IT',
    SelloJefe: null,
    leyendaJefe: 'IT Department'
  },
  {
    Deptid: 2,
    DeptName: 'HR',
    SelloJefe: null,
    leyendaJefe: 'Human Resources'
  },
  {
    Deptid: 3,
    DeptName: 'Finance',
    SelloJefe: null,
    leyendaJefe: 'Finance Department'
  }
] as Departamento[];

export const mockUsuarios = [
  {
    id: 1,
    username: 'admin',
    password: 'hashed_password',
    role: 'admin',
    departamento: 'IT',
    departamentosPermitidos: ['IT', 'HR', 'Finance']
  },
  {
    id: 2,
    username: 'user1',
    password: 'hashed_password',
    role: 'user',
    departamento: 'IT',
    departamentosPermitidos: ['IT']
  }
] as Usuario[];

export const mockPersonal = [
  {
    UID: 1,
    MR: '001',
    Nombre: 'John Doe',
    Departamento: 'IT',
    CUIL: '20-12345678-9',
    Jornada: 'Full-time',
    Activo: '1',
    Foto: ''
  },
  {
    UID: 2,
    MR: '002',
    Nombre: 'Jane Smith',
    Departamento: 'HR',
    CUIL: '27-87654321-0',
    Jornada: 'Full-time',
    Activo: '1',
    Foto: ''
  }
] as Personal[];

export const mockMarcadas = [
  {
    LID: 1,
    Personal: mockPersonal[0],
    Marcada: '2023-01-01 09:00',
    Entrada: '2023-01-01 09:00',
    Salida: '2023-01-01 17:00',
    Estado: 'Presente'
  }
] as Marcada[];

// Create mock context for tests
export const createMockContext = (user?: ContextUser): Context => {
  return {
    event: {
      locals: {
        usuario: user ? {
          username: user.username,
          role: user.role,
          departamento: user.departamento || null,
          departamentosPermitidos: user.departamentosPermitidos || [],
        } : null
      }
    } as any,
    user: user || undefined
  };
};

// Mock database functions
export const mockDatabase = {
  getDepartamentos: vi.fn().mockResolvedValue(mockDepartamentos),
  getDepartamentoByName: vi.fn().mockImplementation((deptName: string) => {
    return Promise.resolve(mockDepartamentos.find(d => d.DeptName === deptName) || null);
  }),
  updateDepartamento: vi.fn().mockResolvedValue(undefined),
  getPersonal: vi.fn().mockResolvedValue(mockPersonal),
  getPersonalById: vi.fn().mockImplementation((id: string) => {
    return Promise.resolve(mockPersonal.find(p => p.UID.toString() === id) || null);
  }),
  createPersonal: vi.fn().mockImplementation((personal: Personal) => {
    return Promise.resolve({ ...personal, UID: 99 });
  }),
  updatePersonal: vi.fn().mockResolvedValue(undefined),
  getUsuarios: vi.fn().mockResolvedValue(mockUsuarios),
  getUsuario: vi.fn().mockImplementation((username: string) => {
    return Promise.resolve(mockUsuarios.find(u => u.username === username) || null);
  }),
  createUsuario: vi.fn().mockResolvedValue(undefined),
  updateUsuario: vi.fn().mockResolvedValue(undefined),
  deleteUsuario: vi.fn().mockResolvedValue(undefined),
  loginWebUser: vi.fn().mockImplementation((username: string, password: string) => {
    const user = mockUsuarios.find(u => u.username === username);
    if (user && password === 'valid_password') {
      return Promise.resolve({
        WebUser: user,
        token: 'mock_jwt_token'
      });
    }
    return Promise.resolve({ error: 'Credenciales incorrectas' });
  }),
  getMarcadasDelDia: vi.fn().mockResolvedValue(mockMarcadas),
  getMarcadasEstandar: vi.fn().mockResolvedValue(mockMarcadas),
  getMarcadasEntreFechas: vi.fn().mockResolvedValue(mockMarcadas)
};