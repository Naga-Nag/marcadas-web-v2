import type { Personal } from '$lib/types/gen';
import sql from 'mssql';
import { connection } from './db';
import { DepartamentofromDeptID, DeptIDfromDepartamento } from './departamento';

export function getPersonal(): Promise<Personal[]> {
     return new Promise((resolve, reject) => {
          const request = connection.request();
          const query = `USE ${Bun.env.DB}; SELECT Userid, UserCode, Name, Deptid, Picture, Activo, CUIL, Jornada FROM dbo.UserInfo;`;
          request.query(query);
          let personal: Personal[] = [];
          request.on("row", (row) => {
               processRow(row);
               personal.push(row);
          });
          request.on("done", () => {
               console.log("DB :: fetchPersonal:", personal);
               resolve(personal);
          });
          request.on("error", (err) => {
               console.error("DB :: fetchPersonal: SQL Error:", err);
               reject(err);
          });
     });
}

export function getPersonalByDepartamento(departamento: string): Promise<Personal[]> {
     return new Promise((resolve, reject) => {
          const request = connection.request();
          request.input("id", sql.Int, DeptIDfromDepartamento(departamento));
          const query = `USE ${Bun.env.DB}; SELECT Userid, UserCode, Name, Deptid, Picture, Activo, CUIL, Jornada FROM dbo.UserInfo WHERE Deptid = @id;`;
          request.query(query);
          let personal: Personal[] = [];
          request.on("row", (row) => {
               processRow(row);
               personal.push(row);
          });
          request.on("done", () => {
               console.log("DB :: fetchPersonalByDepartamento:", personal);
               resolve(personal);
          });
          request.on("error", (err) => {
               console.error("DB :: fetchPersonalByDepartamento: SQL Error:", err);
               reject(err);
          });
     });
}

export function getPersonalById(id: string): Promise<Personal | null> {
     return new Promise((resolve, reject) => {
          const request = connection.request();
          request.input("id", sql.NVarChar, id);
          const query = `USE ${Bun.env.DB}; SELECT Userid, UserCode, Name, Deptid, Picture, Activo, CUIL, Jornada FROM dbo.UserInfo WHERE Userid = @id;`;
          request.query(query);
          let personal: Personal | null = null;
          request.on("row", (row) => {
               processRow(row);
               personal = row;
          });
          request.on("done", () => {
               console.log("DB :: fetchPersonalById:", personal);
               resolve(personal);
          });
          request.on("error", (err) => {
               console.error("DB :: fetchPersonalById: SQL Error:", err);
               reject(err);
          });
     });
}

export function createPersonal(personal: Personal): Promise<Personal> {
     return new Promise((resolve, reject) => {
          const request = connection.request();
          request.input("code", sql.NVarChar, personal.MR);
          request.input("name", sql.NVarChar, personal.Nombre);
          request.input("deptid", sql.Int, personal.Departamento ? DeptIDfromDepartamento(personal.Departamento) : null);
          request.input("picture", sql.NVarChar, personal.Foto);
          request.input("activo", sql.Bit, personal.Activo);
          request.input("cuil", sql.NVarChar, personal.CUIL);
          request.input("jornada", sql.NVarChar, personal.Jornada);

          const query = `USE ${Bun.env.DB}; INSERT INTO dbo.UserInfo (UserCode, Name, Deptid, Picture, Activo, CUIL, Jornada) VALUES (@code, @name, @deptid, @picture, @activo, @cuil, @jornada);`;
          request.query(query);

          request.on("done", () => {
               console.log("DB :: createPersonal:", personal);
               resolve(personal);
          });

          request.on("error", (err) => {
               console.error("DB :: createPersonal: SQL Error:", err);
               reject(err);
          });
     });
}

function flattenPersonalFields(personal: any): any {
    const flat: any = { ...personal };
    for (const key in flat) {
        if (key.startsWith('Personal.')) {
            const newKey = key.replace('Personal.', '');
            flat[newKey] = flat[key];
            delete flat[key];
        }
    }
    return flat;
}

export async function updatePersonal(personal: Partial<Personal>): Promise<void> {
    if (!personal.UID) {
        return Promise.reject(new Error("UID is required to update personal information."));
    }
    const flatPersonal = flattenPersonalFields(personal);
    console.log("DB :: updatePersonal:", flatPersonal);
    return new Promise(async (resolve, reject) => {
        const request = connection.request();
        request.input("id", sql.Int, flatPersonal.UID);

        let setFields = [];
        if (flatPersonal.MR !== undefined) {
            request.input("code", sql.NVarChar, flatPersonal.MR);
            setFields.push("UserCode = @code");
        }
        if (flatPersonal.Nombre !== undefined) {
            request.input("name", sql.NVarChar, flatPersonal.Nombre);
            setFields.push("Name = @name");
        }
        if (flatPersonal.Departamento !== undefined) {
            request.input("deptid", sql.Int, await DeptIDfromDepartamento(flatPersonal.Departamento));
            setFields.push("Deptid = @deptid");
        }
        if (flatPersonal.Activo !== undefined) {
            request.input("activo", sql.Bit, flatPersonal.Activo);
            setFields.push("Activo = @activo");
        }
        if (flatPersonal.CUIL !== undefined) {
            request.input("cuil", sql.NVarChar, flatPersonal.CUIL);
            setFields.push("CUIL = @cuil");
        }
        if (flatPersonal.Jornada !== undefined) {
            request.input("jornada", sql.NVarChar, flatPersonal.Jornada);
            setFields.push("Jornada = @jornada");
        }
        // Si quieres actualizar la foto, agrega aquí el bloque de Picture

        if (setFields.length === 0) {
            return resolve(); // Nada que actualizar
        }

        const query = `USE ${Bun.env.DB}; UPDATE dbo.UserInfo SET ${setFields.join(', ')} WHERE Userid = @id;`;

        request.query(query);

        request.on("done", () => {
            console.log("DB :: updatePersonal:", flatPersonal);
            resolve();
        });

        request.on("error", (err) => {
            console.error("DB :: updatePersonal: SQL Error:", err);
            reject(err);
        });
    });
}


function processRow(row: any) {
     row.MR = row.UserCode;
     row.Nombre = row.Name;
     row.Departamento = DepartamentofromDeptID(row.Dept);
     row.Foto = row.Picture;
     
}