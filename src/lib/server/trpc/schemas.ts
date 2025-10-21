import { z } from 'zod';

// Personal schemas
export const personalSchema = z.object({
  UID: z.number().optional(),
  MR: z.string().min(1, 'MR is required'),
  Nombre: z.string().min(1, 'Nombre is required'),
  Departamento: z.string().optional(),
  CUIL: z.string().optional(),
  Jornada: z.string().optional(),
  Activo: z.boolean().optional(),
  Foto: z.string().optional()
});

export const createPersonalSchema = personalSchema.omit({ UID: true });
export const updatePersonalSchema = personalSchema.partial().required({ UID: true });

// Departamento schemas
export const departamentoSchema = z.object({
  Deptid: z.number().optional(),
  DeptName: z.string().min(1, 'Department name is required'),
  SelloJefe: z.string().nullable().optional(),
  leyendaJefe: z.string().nullable().optional()
});

export const updateDepartamentoSchema = departamentoSchema.partial().required({ Deptid: true }).or(
  departamentoSchema.partial().required({ DeptName: true })
);

// Usuario schemas
export const usuarioSchema = z.object({
  id: z.number().optional(),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Role is required'),
  departamento: z.string().optional(),
  departamentosPermitidos: z.array(z.string()).optional()
});

export const shortUsuarioSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  role: z.string().min(1, 'Role is required'),
  departamento: z.string().optional(),
  departamentosPermitidos: z.array(z.string()).optional()
});

export const createUsuarioSchema = usuarioSchema.omit({ id: true });
export const updateUsuarioSchema = shortUsuarioSchema.partial().required({ username: true }).extend({
  password: z.string().min(6, 'Password must be at least 6 characters').optional()
});
export const loginUsuarioSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

// Marcadas schemas
export const marcadaSchema = z.object({
  LID: z.number().optional(),
  Personal: personalSchema.optional(),
  Marcada: z.string().nullable().optional(),
  Entrada: z.string().nullable().optional(),
  Salida: z.string().nullable().optional(),
  Estado: z.string().nullable().optional()
});

export const getMarcadasSchema = z.object({
  departamento: z.string().min(1, 'Department is required'),
  fecha: z.string().min(1, 'Date is required'),
  funcion: z.enum(['delDia', 'estandar']).optional().default('delDia')
});

// Authentication schemas
export const authedUserSchema = z.object({
  username: z.string(),
  role: z.string(),
  departamento: z.string().nullable(),
  departamentosPermitidos: z.array(z.string())
});

// Generic delete schema
export const deleteSchema = z.object({
  username: z.string().min(1, 'Username is required')
});