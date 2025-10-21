import { connection } from './db';
import type { Departamento } from '$lib/types/gen';
import sql from "mssql";

export async function getDepartamentos(): Promise<Array<Departamento>> {
  await connection?.connect();

  return new Promise(async (resolve, reject) => {
    const rows: Array<Departamento> = [];
    const request = connection.request();
    request.arrayRowMode = true;

    // Define and execute the query
    const query = `USE ${Bun.env.DB}; SELECT Deptid, DeptName, selloJefe, leyendaJefe FROM Dept;`;
    request.query(query);

    request.on('row', (row) => {
      const departamento: Departamento = {
        Deptid: row[0],
        DeptName: row[1],
        SelloJefe: row[2] ? row[2].toString('base64') : null,
        leyendaJefe: row[3]
      };
      rows.push(departamento);
    });

    request.on('error', (err) => {
      console.error('Error fetching data:', err);
      reject(err);
    });

    request.on('done', () => {
      console.log("INFO db :: " + rows.length + " departamentos encontrados");
      resolve(rows);
    });
  });
}

export async function getDepartamentoByName(deptName: string): Promise<Departamento | null> {
  return new Promise((resolve, reject) => {
    const request = connection.request();
    request.arrayRowMode = true;
    // Set up the query for detailed data
    const query = `USE ${Bun.env.DB}; SELECT Deptid, DeptName, selloJefe, leyendaJefe FROM Dept WHERE DeptName = @deptName;`;
    request.input('deptName', sql.NVarChar, deptName);

    request.query(query);

    request.on('row', (row) => {
      const departamento: Departamento = {
        Deptid: row[0],
        DeptName: row[1],
        SelloJefe: row[2] ? row[2].toString('base64') : null,
        leyendaJefe: row[3]
      };
      resolve(departamento);
    });

    request.on('error', (err) => {
      console.error('Error fetching data:', err);
      reject(err);
    });
  });
}

export async function DepartamentofromDeptID(deptid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = connection.request();
    request.arrayRowMode = true;
    // Set up the query for detailed data
    const query = `USE ${Bun.env.DB}; SELECT DeptName FROM Dept WHERE Deptid = '${deptid}';`;

    request.query(query);

    request.on('row', (row) => {
      resolve(row[0]);
    });

    request.on('error', (err) => {
      console.error('Error fetching data:', err);
      reject(err);
    });
  });
}

export async function DeptIDfromDepartamento(departamento: string): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const request = new sql.Request();
    request.arrayRowMode = true;
    let found = false;

    const query = `USE ${Bun.env.DB}; SELECT Deptid FROM Dept WHERE DeptName = @departamento;`;
    request.input('departamento', sql.NVarChar, departamento);

    request.query(query);

    request.on('row', (row) => {
      found = true;
      resolve(row[0]);
    });

    request.on('done', () => {
      if (!found) resolve(null);
    });

    request.on('error', (err) => {
      console.error('Error fetching data:', err);
      reject(err);
    });
  });
}

export async function setSelloJefe(dept: string | number, sello: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = connection.request();
    request.arrayRowMode = true;

    // Set up the query for updating the sello (IMAGE field)
    const query = `USE ${Bun.env.DB}; UPDATE Dept SET selloJefe = @sello WHERE Deptid = @dept;`;
    request.input('sello', sql.Image, sello);
    request.input('dept', sql.Int, dept);

    request.query(query);

    request.on('done', () => {
      resolve();
    });

    request.on('error', (err) => {
      console.error('Error updating sello:', err);
      reject(err);
    });
  });
}

export async function getSelloJefeFromDepartamento(dept: string | number): Promise<Buffer> {
  if (typeof dept === 'string') {
    const result = await DeptIDfromDepartamento(dept);
    if (result === null) {
      throw new Error(`No DeptID found for departamento: ${dept}`);
    }
    dept = result;
  }
  return new Promise((resolve, reject) => {
    const request = connection.request();
    request.arrayRowMode = true;

    // Set up the query for updating the sello (IMAGE field)
    const query = `USE ${Bun.env.DB}; SELECT selloJefe FROM Dept WHERE Deptid = @dept;`;
    request.input('dept', sql.Int, dept);

    request.query(query);

    request.on('row', (row) => {
      resolve(row[0]);
    });

    request.on('error', (err) => {
      console.error('Error fetching sello:', err);
      reject(err);
    });
  });
}

export async function updateDepartamento(depto: Partial<Departamento>) {
  return new Promise<void>((resolve, reject) => {
    const request = connection.request();
    request.arrayRowMode = true;

    // Only Deptid or DeptName is required to identify the row
    if (!depto.Deptid && !depto.DeptName) {
      return reject(new Error('Either Deptid or DeptName must be provided to identify the departamento.'));
    }

    // Build SET clause dynamically
    const setClauses: string[] = [];
    if (depto.DeptName !== undefined) {
      setClauses.push('DeptName = @deptName');
      request.input('deptName', sql.NVarChar, depto.DeptName);
    }
    if (depto.SelloJefe !== undefined) {
      let bufferValue: Buffer | null = null;
      if (typeof depto.SelloJefe === 'string') {
        bufferValue = Buffer.from(depto.SelloJefe, 'base64');
      } else if (Buffer.isBuffer(depto.SelloJefe)) {
        bufferValue = depto.SelloJefe;
      }
      setClauses.push('selloJefe = @selloJefe');
      request.input('selloJefe', sql.Image, bufferValue);
    }
    if (depto.leyendaJefe !== undefined) {
      setClauses.push('leyendaJefe = @leyendaJefe');
      request.input('leyendaJefe', sql.NVarChar, depto.leyendaJefe);
    }

    if (setClauses.length === 0) {
      return reject(new Error('No fields to update.'));
    }

    // Build WHERE clause
    let whereClause = '';
    if (depto.Deptid !== undefined) {
      whereClause = 'Deptid = @deptid';
      request.input('deptid', sql.Int, depto.Deptid);
    } else if (depto.DeptName !== undefined) {
      whereClause = 'DeptName = @deptName';
      // deptName input already set above
    }

    const query = `USE ${Bun.env.DB}; UPDATE Dept SET ${setClauses.join(', ')} WHERE ${whereClause};`;

    request.query(query);

    request.on('done', () => {
      resolve();
    });

    request.on('error', (err) => {
      console.error('Error updating departamento:', err);
      reject(err);
    });
  });
}
