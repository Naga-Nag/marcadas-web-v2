import { get } from 'http';
import {connection, processRow} from './db';
import sql from "mssql";

export async function getDepartamentos(): Promise<Array<Record<string, any>>> {
  await connection?.connect();

  return new Promise(async (resolve, reject) => {
    const rows: Array<Record<string, any>> = [];
    const request = connection.request();
    request.arrayRowMode = true;

    // Define and execute the query
    const query = `USE ${Bun.env.DB}; SELECT DeptName FROM Dept;`;
    request.query(query);

    request.on('row', (row) => {
      rows.push(row[0]);
    });

    request.on('error', (err) => {
      console.error('Error fetching data:', err);
      reject(err);
    });

    request.on('done', () => {
      resolve(rows);
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
    const query = `USE ${Bun.env.DB}; UPDATE Dept SET SelloJefe = @sello WHERE Deptid = @dept;`;
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

export async function setLeyendaSello(dept: string | number, leyenda: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = connection.request();
    request.arrayRowMode = true;

    // Set up the query for updating the leyenda
    const query = `USE ${Bun.env.DB}; UPDATE Dept SET leyendaJefe = @leyenda WHERE Deptid = @dept;`;
    request.input('leyenda', sql.NVarChar, leyenda);
    request.input('dept', sql.Int, dept);

    request.query(query);

    request.on('done', () => {
      resolve();
    });

    request.on('error', (err) => {
      console.error('Error updating leyenda:', err);
      reject(err);
    });
  });
}
