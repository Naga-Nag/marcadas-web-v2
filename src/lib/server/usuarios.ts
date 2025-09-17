import { connection } from "$lib/server/db";
import type { Marcada, shortUsuario, Usuario } from "$lib/types/gen";
import sql from "mssql";
import { DeptIDfromDepartamento } from "./departamento";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';




export async function getUsuarios(): Promise<Usuario[]> {
     try {
          return new Promise((resolve, reject) => {
               const request = connection.request();

               const query = `USE ${Bun.env.DB}; SELECT * FROM dbo.WebUsers;`;
               request.query(query);

               let usuarios: Usuario[] = [];
               request.on("row", (row) => {
                    // Si departamentosPermitidos es string, parsea a array
                    if (typeof row.departamentosPermitidos === 'string') {
                         try {
                              row.departamentosPermitidos = JSON.parse(row.departamentosPermitidos);
                         } catch {
                              row.departamentosPermitidos = [];
                         }
                    }
                    usuarios.push(row);
               });

               request.on("done", () => {
                    console.log("DB :: fetchUsuarios:", usuarios);
                    resolve(usuarios);
               });

               request.on("error", (err) => {
                    console.error("DB :: fetchUsuarios: SQL Error:", err);
                    reject(err);
               });
          });

     } catch (err) {
          console.error("Error in fetchUsuarios:", err);
          throw new Error("Error fetching usuarios");
     }
}

export async function getUsuario(username: string): Promise<Usuario | null> {
     try {
          console.log("DB :: getUsuario: Fetching user", username);
          return new Promise((resolve, reject) => {
               const request = connection.request();
               request.input("username", sql.NVarChar, username);

               const query = `USE ${Bun.env.DB}; SELECT * FROM WebUsers WHERE username = @username;`;
               request.query(query);

               let usuario: Usuario | null = null;
               request.on("row", (row) => {
                    console.log("DB :: getUsuario: User row received", { username: row.username, role: row.role });
                    // Asegúrate de parsear si es string
                    if (typeof row.departamentosPermitidos === 'string') {
                         try {
                              row.departamentosPermitidos = JSON.parse(row.departamentosPermitidos);
                         } catch {
                              row.departamentosPermitidos = [];
                         }
                    }

                    usuario = row;
               });

               request.on("done", () => {
                    console.log("DB :: getUsuario: User fetch completed", { userFound: !!usuario, username });
                    resolve(usuario);
               });

               request.on("error", (err) => {
                    console.error("DB :: getUsuario: SQL Error:", err);
                    reject(err);
               });
          });

     } catch (err) {
          console.error("DB :: getUsuario: Error fetching user", username, err);
          throw new Error("Error fetching usuario");
     }
}


export function createUsuario(usuario: Usuario) {
     try {
          return new Promise((resolve, reject) => {
               const request = connection.request();

               request.input("username", sql.NVarChar, usuario.username);
               request.input("password", sql.NVarChar, usuario.password);
               request.input("role", sql.NVarChar, usuario.role);
               request.input("departamento", sql.NVarChar, usuario.departamento);
               request.input("departamentosPermitidos", sql.NVarChar, JSON.stringify(usuario.departamentosPermitidos));


               const query = `USE ${Bun.env.DB}; INSERT INTO WebUsers (username, password, role, departamento, departamentosPermitidos) VALUES (@username, @password, @role, @departamento, @departamentosPermitidos)`;
               request.query(query);

               request.on("done", (result) => {
                    console.log("DB :: createUsuario:", result);
                    resolve(result);
               });

               request.on("error", (err) => {
                    console.error("DB :: createUsuario: SQL Error:", err);
                    reject(err);
               });
          });

     } catch (err) {
          console.error("Error in createUsuario:", err);
          throw new Error("Error creating usuario");
     }
}

export async function updateUsuario(usuario: Partial<shortUsuario>) {
     return new Promise((resolve, reject) => {
          if (!usuario.username) {
               return reject(new Error("El nombre de usuario es obligatorio para actualizar"));
          }

          // Build dynamic SET clause
          const fields: string[] = [];
          const request = connection.request();

          request.input("username", sql.NVarChar, usuario.username);

          if (usuario.role !== undefined) {
               fields.push("role = @role");
               request.input("role", sql.NVarChar, usuario.role);
          }
          if (usuario.departamento !== undefined) {
               fields.push("departamento = @departamento");
               request.input("departamento", sql.NVarChar, usuario.departamento);
          }
          if (usuario.departamentosPermitidos !== undefined) {
               fields.push("departamentosPermitidos = @departamentosPermitidos");
               request.input("departamentosPermitidos", sql.NVarChar, JSON.stringify(usuario.departamentosPermitidos));
          }

          if (fields.length === 0) {
               return resolve({ message: "Sin cambios" });
          }

          const setClause = fields.join(", ");
          const query = `USE ${Bun.env.DB}; UPDATE WebUsers SET ${setClause} WHERE username = @username;`;
          request.query(query);

          request.on("done", (result) => {
               console.log("DB :: updateUsuario:", result);
               resolve(result);
          });

          request.on("error", (err) => {
               console.error("DB :: updateUsuario: SQL Error:", err);
               reject(err);
          });
     });
}

export async function deleteUsuario(username: string) {
     try {
          return new Promise((resolve, reject) => {
               const request = connection.request();
               request.input("username", sql.NVarChar, username);

               const query = `USE ${Bun.env.DB}; DELETE FROM WebUsers WHERE username = @username;`;
               request.query(query);

               request.on("done", (result) => {
                    console.log("DB :: deleteUsuario:", result);
                    resolve(result);
               });

               request.on("error", (err) => {
                    console.error("DB :: deleteUsuario: SQL Error:", err);
                    reject(err);
               });
          });
     } catch (err) {
          console.error("Error in deleteUsuario:", err);
          throw new Error("Error deleting usuario");
     }
}



async function UserfromUID(uid: string): Promise<Record<string, any>> {
     return new Promise((resolve, reject) => {
          const request = connection.request();
          request.arrayRowMode = true;
          // Set up the query for detailed data
          const query = `USE ${Bun.env.DB}; SELECT * FROM UserInfo WHERE Userid = '${uid}';`;

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

export async function loginWebUser(username: string, password: string): Promise<{ WebUser: Usuario, token: string } | { error: string }> {
     try {
          console.log("DB :: loginWebUser: Attempting login for user", username);

          return new Promise((resolve, reject) => {
               const request = connection.request();

               request.input("username", sql.VarChar, username);
               const query = `USE ${Bun.env.DB}; SELECT * FROM dbo.WebUsers WHERE username = @username;`;

               let userFound = false;

               request.query(query);

               request.on("row", async (row) => {
                    console.log("DB :: loginWebUser: User found in database", { username: row.username, role: row.role });
                    userFound = true;

                    try {
                         const isPasswordValid = await bcrypt.compare(password, row.password);
                         console.log("DB :: loginWebUser: Password validation result", isPasswordValid);
                         if (!isPasswordValid) {
                              console.warn("DB :: loginWebUser: Invalid password for user", username);
                              return resolve({ error: "Credenciales incorrectas" });
                         }

                         if (!Bun.env.JWT_SECRET) {
                              throw new Error("JWT_SECRET no definido");
                         }

                         const token = jwt.sign({ username }, Bun.env.JWT_SECRET, { expiresIn: "1h" });
                         console.log("DB :: loginWebUser: JWT token issued for user", username);

                         resolve({
                              WebUser: {
                                   id: row.id,
                                   username: row.username,
                                   password: row.password,
                                   role: row.role,
                                   departamento: row.departamento,
                                   departamentosPermitidos: row.departamentosPermitidos,
                              },
                              token
                         });
                    } catch (error) {
                         console.error("DB :: loginWebUser: Error comparing passwords for user", username, error);
                         reject({ error: "Authentication failed" });
                    }
               });

               request.on("done", () => {
                    if (!userFound) {
                         console.warn("DB :: loginWebUser: User not found in database", username);
                         resolve({ error: "User not found" });
                    } else {
                         console.log("DB :: loginWebUser: Login process completed for user", username);
                    }
               });

               request.on("error", (err) => {
                    console.error("DB :: loginWebUser: SQL Error for user", username, err);
                    reject({ error: "Authentication failed" });
               });
          });

     } catch (err) {
          console.error("DB :: loginWebUser: Unexpected error", err);
          throw new Error("Authentication failed");
     }
}

export async function setUserDepaPermitidos(username: string, depaPermitidos: string[]) {
     try {
          const depaPermitidosJSON = JSON.stringify(depaPermitidos);

          const query = `
        UPDATE dbo.WebUsers
        SET departamentosPermitidos = @depaPermitidos
        WHERE username = @username;
    `;

          const request = connection.request();
          request.input('username', sql.VarChar, username);
          request.input('depaPermitidos', sql.VarChar, depaPermitidosJSON);

          await request.query(query);
          return true;
     } catch (err) {
          console.error('Error updating departamentos permitidos:', err);
          return false;
     }
}