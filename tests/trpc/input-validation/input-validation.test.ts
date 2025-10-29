import { describe, it, expect } from 'vitest';
import { 
  createPersonalSchema, 
  updatePersonalSchema, 
  updateDepartamentoSchema,
  createUsuarioSchema,
  updateUsuarioSchema,
  loginUsuarioSchema,
  getMarcadasSchema,
  deleteSchema
} from '$lib/server/trpc/schemas';

describe('Input Validation Coverage Tests', () => {
  describe('Personal Schemas', () => {
    describe('createPersonalSchema', () => {
      it('should validate valid personal data', () => {
        const validData = {
          MR: '01',
          Nombre: 'John Doe',
          Departamento: 'IT',
          CUIL: '20-12345678-9',
          Jornada: 'Full-time',
          Activo: true,
          Foto: 'path/to/photo.jpg'
        };

        expect(() => createPersonalSchema.parse(validData)).not.toThrow();
        expect(createPersonalSchema.parse(validData)).toEqual(validData);
      });

      it('should reject personal data with missing required fields', () => {
        // Missing MR
        expect(() => createPersonalSchema.parse({
          Nombre: 'John Doe'
        })).toThrow();

        // Missing Nombre
        expect(() => createPersonalSchema.parse({
          MR: '001'
        })).toThrow();
      });

      it('should reject personal data with invalid field types', () => {
        // MR not a string
        expect(() => createPersonalSchema.parse({
          MR: 123,
          Nombre: 'John Doe'
        })).toThrow();

        // Nombre not a string
        expect(() => createPersonalSchema.parse({
          MR: '001',
          Nombre: 123
        })).toThrow();

        // MR too short (empty)
        expect(() => createPersonalSchema.parse({
          MR: '',
          Nombre: 'John Doe'
        })).toThrow();

        // Nombre too short (empty)
        expect(() => createPersonalSchema.parse({
          MR: '001',
          Nombre: ''
        })).toThrow();
      });
    });

    describe('updatePersonalSchema', () => {
      it('should validate valid personal update data', () => {
        const validData = {
          UID: 1,
          MR: '001',
          Nombre: 'Updated Name',
          Departamento: 'HR'
        };

        expect(() => updatePersonalSchema.parse(validData)).not.toThrow();
        expect(updatePersonalSchema.parse(validData)).toEqual(validData);
      });

      it('should require UID for updates', () => {
        // Should reject without UID
        expect(() => updatePersonalSchema.parse({
          Nombre: 'Updated Name'
        })).toThrow();

        // Should accept with UID only
        expect(() => updatePersonalSchema.parse({
          UID: 1
        })).not.toThrow();
      });

      it('should allow partial updates', () => {
        // Only UID and one other field
        expect(() => updatePersonalSchema.parse({
          UID: 1,
          Nombre: 'Updated Name'
        })).not.toThrow();

        // Only UID and multiple other fields
        expect(() => updatePersonalSchema.parse({
          UID: 1,
          Nombre: 'Updated Name',
          Departamento: 'HR',
          Activo: false
        })).not.toThrow();
      });
    });
  });

  describe('Departamento Schemas', () => {
    describe('updateDepartamentoSchema', () => {
      it('should validate valid departamento update data with Deptid', () => {
        const validData = {
          Deptid: 1,
          DeptName: 'Updated IT',
          leyendaJefe: 'New Legend'
        };

        expect(() => updateDepartamentoSchema.parse(validData)).not.toThrow();
        expect(updateDepartamentoSchema.parse(validData)).toEqual(validData);
      });

      it('should validate valid departamento update data with DeptName', () => {
        const validData = {
          DeptName: 'IT Department',
          leyendaJefe: 'New Legend'
        };

        expect(() => updateDepartamentoSchema.parse(validData)).not.toThrow();
        expect(updateDepartamentoSchema.parse(validData)).toEqual(validData);
      });

      it('should require either Deptid or DeptName', () => {
        // Should reject without either Deptid or DeptName
        expect(() => updateDepartamentoSchema.parse({
          leyendaJefe: 'New Legend'
        })).toThrow();

        // Should accept with Deptid
        expect(() => updateDepartamentoSchema.parse({
          Deptid: 1,
          leyendaJefe: 'New Legend'
        })).not.toThrow();

        // Should accept with DeptName
        expect(() => updateDepartamentoSchema.parse({
          DeptName: 'IT',
          leyendaJefe: 'New Legend'
        })).not.toThrow();
      });

      it('should reject when both Deptid and DeptName are missing', () => {
        expect(() => updateDepartamentoSchema.parse({
          leyendaJefe: 'New Legend',
          SelloJefe: null
        })).toThrow();
      });
    });
  });

  describe('Usuario Schemas', () => {
    describe('createUsuarioSchema', () => {
      it('should validate valid usuario data', () => {
        const validData = {
          username: 'testuser',
          password: 'password123',
          role: 'user',
          departamento: 'IT',
          departamentosPermitidos: ['IT', 'HR']
        };

        expect(() => createUsuarioSchema.parse(validData)).not.toThrow();
        expect(createUsuarioSchema.parse(validData)).toEqual(validData);
      });

      it('should reject usuario data with missing required fields', () => {
        // Missing username
        expect(() => createUsuarioSchema.parse({
          password: 'password123',
          role: 'user'
        })).toThrow();

        // Missing password
        expect(() => createUsuarioSchema.parse({
          username: 'testuser',
          role: 'user'
        })).toThrow();

        // Missing role
        expect(() => createUsuarioSchema.parse({
          username: 'testuser',
          password: 'password123'
        })).toThrow();
      });

      it('should reject usuario data with invalid field types or values', () => {
        // Username too short
        expect(() => createUsuarioSchema.parse({
          username: '',
          password: 'password123',
          role: 'user'
        })).toThrow();

        // Password too short
        expect(() => createUsuarioSchema.parse({
          username: 'testuser',
          password: '123',
          role: 'user'
        })).toThrow();

        // Role too short
        expect(() => createUsuarioSchema.parse({
          username: 'testuser',
          password: 'password123',
          role: ''
        })).toThrow();

        // departamentosPermitidos not an array
        expect(() => createUsuarioSchema.parse({
          username: 'testuser',
          password: 'password123',
          role: 'user',
          departamentosPermitidos: 'not-an-array'
        })).toThrow();
      });
    });

    describe('updateUsuarioSchema', () => {
      it('should validate valid usuario update data', () => {
        const validData = {
          username: 'testuser',
          role: 'admin',
          departamento: 'IT',
          departamentosPermitidos: ['IT']
        };

        expect(() => updateUsuarioSchema.parse(validData)).not.toThrow();
        expect(updateUsuarioSchema.parse(validData)).toEqual(validData);
      });

      it('should require username for updates', () => {
        // Should reject without username
        expect(() => updateUsuarioSchema.parse({
          role: 'admin'
        })).toThrow();

        // Should accept with username only
        expect(() => updateUsuarioSchema.parse({
          username: 'testuser'
        })).not.toThrow();
      });

      it('should allow optional password update', () => {
        const validData = {
          username: 'testuser',
          password: 'newpassword123'
        };

        expect(() => updateUsuarioSchema.parse(validData)).not.toThrow();
        expect(updateUsuarioSchema.parse(validData)).toEqual(validData);

        // Password too short should be rejected
        expect(() => updateUsuarioSchema.parse({
          username: 'testuser',
          password: '123'
        })).toThrow();
      });
    });

    describe('loginUsuarioSchema', () => {
      it('should validate valid login data', () => {
        const validData = {
          username: 'testuser',
          password: 'password123'
        };

        expect(() => loginUsuarioSchema.parse(validData)).not.toThrow();
        expect(loginUsuarioSchema.parse(validData)).toEqual(validData);
      });

      it('should reject login data with missing required fields', () => {
        // Missing username
        expect(() => loginUsuarioSchema.parse({
          password: 'password123'
        })).toThrow();

        // Missing password
        expect(() => loginUsuarioSchema.parse({
          username: 'testuser'
        })).toThrow();

        // Empty fields
        expect(() => loginUsuarioSchema.parse({
          username: '',
          password: 'password123'
        })).toThrow();

        expect(() => loginUsuarioSchema.parse({
          username: 'testuser',
          password: ''
        })).toThrow();
      });
    });
  });

  describe('Marcadas Schemas', () => {
    describe('getMarcadasSchema', () => {
      it('should validate valid marcadas query data', () => {
        const validData = {
          departamento: 'IT',
          fecha: '2023-01-01',
          funcion: 'delDia' as const
        };

        expect(() => getMarcadasSchema.parse(validData)).not.toThrow();
        expect(getMarcadasSchema.parse(validData)).toEqual(validData);

        // With default funcion
        const validData2 = {
          departamento: 'HR',
          fecha: '2023-12-25'
        };
        expect(() => getMarcadasSchema.parse(validData2)).not.toThrow();
      });

      it('should reject marcadas query data with missing required fields', () => {
        // Missing departamento
        expect(() => getMarcadasSchema.parse({
          fecha: '2023-01-01'
        })).toThrow();

        // Missing fecha
        expect(() => getMarcadasSchema.parse({
          departamento: 'IT'
        })).toThrow();

        // Empty fields
        expect(() => getMarcadasSchema.parse({
          departamento: '',
          fecha: '2023-01-01'
        })).toThrow();

        expect(() => getMarcadasSchema.parse({
          departamento: 'IT',
          fecha: ''
        })).toThrow();
      });

      it('should only allow valid funcion values', () => {
        // Valid funcion values
        expect(() => getMarcadasSchema.parse({
          departamento: 'IT',
          fecha: '2023-01-01',
          funcion: 'delDia' as const
        })).not.toThrow();

        expect(() => getMarcadasSchema.parse({
          departamento: 'IT',
          fecha: '2023-01-01',
          funcion: 'estandar' as const
        })).not.toThrow();

        // Invalid funcion value
        expect(() => getMarcadasSchema.parse({
          departamento: 'IT',
          fecha: '2023-01-01',
          funcion: 'invalid' as any
        })).toThrow();
      });
    });
  });

  describe('Generic Schemas', () => {
    describe('deleteSchema', () => {
      it('should validate valid delete data', () => {
        const validData = {
          username: 'testuser'
        };

        expect(() => deleteSchema.parse(validData)).not.toThrow();
        expect(deleteSchema.parse(validData)).toEqual(validData);
      });

      it('should reject delete data with missing or invalid fields', () => {
        // Missing username
        expect(() => deleteSchema.parse({})).toThrow();

        // Empty username
        expect(() => deleteSchema.parse({
          username: ''
        })).toThrow();

        // Invalid field type
        expect(() => deleteSchema.parse({
          username: 123
        })).toThrow();
      });
    });
  });

  describe('Edge Cases and Complex Validations', () => {
    it('should handle complex nested validations', () => {
      // Test departamentosPermitidos as array of strings
      const validUsuario = createUsuarioSchema.parse({
        username: 'testuser',
        password: 'password123',
        role: 'user',
        departamento: 'IT',
        departamentosPermitidos: ['IT', 'HR', 'Finance', 'Admin']
      });

      expect(validUsuario.departamentosPermitidos).toEqual(['IT', 'HR', 'Finance', 'Admin']);
    });

    it('should handle nullable fields correctly', () => {
      // Test nullable fields in updateDepartamentoSchema
      const validUpdate = updateDepartamentoSchema.parse({
        Deptid: 1,
        SelloJefe: null,
        leyendaJefe: 'Test Legend'
      });

      expect(validUpdate.SelloJefe).toBeNull();
      expect(validUpdate.leyendaJefe).toBe('Test Legend');
    });

    it('should validate string field minimum lengths', () => {
      // Test minimum length requirements
      expect(() => createUsuarioSchema.parse({
        username: '', // Empty should fail
        password: 'password123',
        role: 'user'
      })).toThrow();

      expect(() => createUsuarioSchema.parse({
        username: 'valid',
        password: '12345', // Too short
        role: 'user'
      })).toThrow();

      expect(() => createUsuarioSchema.parse({
        username: 'valid',
        password: 'password123',
        role: '' // Empty should fail
      })).toThrow();
    });

    it('should handle optional fields properly', () => {
      // Test that optional fields don't need to be provided
      const validPersonal = createPersonalSchema.parse({
        MR: '001',
        Nombre: 'John Doe'
        // Other fields are optional
      });

      expect(validPersonal.MR).toBe('001');
      expect(validPersonal.Nombre).toBe('John Doe');
      expect(validPersonal.Departamento).toBeUndefined();
      expect(validPersonal.CUIL).toBeUndefined();
      expect(validPersonal.Jornada).toBeUndefined();
      expect(validPersonal.Activo).toBeUndefined();
      expect(validPersonal.Foto).toBeUndefined();
    });
  });
});