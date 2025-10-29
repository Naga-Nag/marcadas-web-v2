import { vi } from 'vitest';

// Mock Bun environment variables
vi.mock('bun:env', () => ({
  env: {
    DB_UID: 'test_user',
    DB_PW: 'test_password',
    DB: 'test_db'
  }
}));

// Mock the database module
vi.mock('$lib/server/db', () => ({
  connection: {
    connect: vi.fn().mockResolvedValue(undefined),
    request: vi.fn(() => ({
      input: vi.fn().mockReturnThis(),
      arrayRowMode: true,
      query: vi.fn().mockReturnThis(),
      on: vi.fn().mockReturnThis(),
      stream: false
    }))
  },
  processRow: vi.fn()
}));

// Mock the mssql module
vi.mock('mssql', async () => {
  const actual = await vi.importActual('mssql');
  return {
    ...actual,
    default: {
      ...actual.default,
      Request: vi.fn(() => ({
        input: vi.fn().mockReturnThis(),
        query: vi.fn().mockReturnThis(),
        on: vi.fn().mockReturnThis(),
        arrayRowMode: true
      }))
    }
  };
});

// Mock bcrypt for usuario operations
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn().mockResolvedValue(true)
}));

// Mock jsonwebtoken for auth operations
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('mock_jwt_token'),
  verify: vi.fn().mockReturnValue({ username: 'testuser' })
}));

// Mock buffer module
vi.mock('buffer', () => ({
  Buffer: {
    from: vi.fn().mockImplementation((str) => str),
    isBuffer: vi.fn().mockReturnValue(false)
 }
}));

// Mock server modules that are used by tRPC routers
vi.mock('$lib/server/personal', () => ({
  getPersonal: vi.fn().mockResolvedValue([
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
  ]),
  getPersonalByDepartamento: vi.fn().mockImplementation((dept: string) => Promise.resolve([
    {
      UID: 1,
      MR: '001',
      Nombre: 'John Doe',
      Departamento: 'IT',
      CUIL: '20-12345678-9',
      Jornada: 'Full-time',
      Activo: '1',
      Foto: ''
    }
  ])),
  getPersonalById: vi.fn().mockImplementation((id: string) => {
    const personal = [
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
    ];
    return Promise.resolve(personal.find(p => p.UID.toString() === id) || null);
  }),
  createPersonal: vi.fn().mockImplementation((personal: any) => Promise.resolve({ ...personal, UID: 99 })),
  updatePersonal: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('$lib/server/departamento', () => ({
  getDepartamentos: vi.fn().mockResolvedValue([
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
  ]),
  getDepartamentoByName: vi.fn().mockImplementation((deptName: string) => {
    const departamentos = [
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
    ];
    return Promise.resolve(departamentos.find(d => d.DeptName === deptName) || null);
  }),
  updateDepartamento: vi.fn().mockResolvedValue(undefined),
  DeptIDfromDepartamento: vi.fn().mockResolvedValue(1),
  DepartamentofromDeptID: vi.fn().mockReturnValue('IT')
}));

vi.mock('$lib/server/usuarios', () => ({
  getUsuarios: vi.fn().mockResolvedValue([
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
  ]),
  getUsuario: vi.fn().mockImplementation((username: string) => {
    const usuarios = [
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
    ];
    return Promise.resolve(usuarios.find(u => u.username === username) || null);
  }),
  createUsuario: vi.fn().mockResolvedValue(undefined),
  updateUsuario: vi.fn().mockResolvedValue(undefined),
  deleteUsuario: vi.fn().mockResolvedValue(undefined),
  loginWebUser: vi.fn().mockImplementation((username: string, password: string) => {
    const usuarios = [
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
    ];
    const user = usuarios.find(u => u.username === username);
    if (user && password === 'valid_password') {
      return Promise.resolve({
        WebUser: user,
        token: 'mock_jwt_token'
      });
    }
    return Promise.resolve({ error: 'Credenciales incorrectas' });
  })
}));

vi.mock('$lib/server/marcadas', () => ({
  getMarcadasDelDia: vi.fn().mockResolvedValue([{
    LID: 1,
    Personal: {
      UID: 1,
      MR: '001',
      Nombre: 'John Doe',
      Departamento: 'IT',
      CUIL: '20-12345678-9',
      Jornada: 'Full-time',
      Activo: '1',
      Foto: ''
    },
    Marcada: '2023-01 09:00',
    Entrada: '2023-01 09:00',
    Salida: '2023-01 17:00',
    Estado: 'Presente'
  }]),
  getMarcadasEstandar: vi.fn().mockResolvedValue([{
    LID: 1,
    Personal: {
      UID: 1,
      MR: '001',
      Nombre: 'John Doe',
      Departamento: 'IT',
      CUIL: '20-12345678-9',
      Jornada: 'Full-time',
      Activo: '1',
      Foto: ''
    },
    Marcada: '2023-01-01 09:00',
    Entrada: '2023-01 09:00',
    Salida: '2023-01-01 17:00',
    Estado: 'Presente'
  }]),
  getMarcadasEntreFechas: vi.fn().mockResolvedValue([{
    LID: 1,
    Personal: {
      UID: 1,
      MR: '001',
      Nombre: 'John Doe',
      Departamento: 'IT',
      CUIL: '20-12345678-9',
      Jornada: 'Full-time',
      Activo: '1',
      Foto: ''
    },
    Marcada: '2023-01 09:00',
    Entrada: '2023-01 09:00',
    Salida: '2023-01-01 17:00',
    Estado: 'Presente'
  }])
}));