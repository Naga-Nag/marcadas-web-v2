import type { Marcada, Personal } from '$lib/types/gen';
import { differenceInMilliseconds } from 'date-fns';
import { connection, processRow } from './db';
import { getPersonalByDepartamento } from './personal';
import sql from "mssql";

// Utilidad para transformar un row plano a { Personal, ... }
function rowToMarcada(row: any): Marcada {
    // Si ya viene con Personal, no lo toques
    if (row.Personal) return row as Marcada;
    const personal: Personal = {
        UID: row.UID,
        MR: row.MR,
        Nombre: row.Nombre,
        Departamento: row.Departamento,
        CUIL: row.CUIL,
        Jornada: row.Jornada,
        Activo: row.Activo,
        Foto: row.Foto ?? ''
    };
    return {
        LID: row.LID,
        Personal: personal,
        Marcada: row.Marcada ?? null,
        Entrada: row.Entrada ?? null,
        Salida: row.Salida ?? null,
        Estado: row.Estado ?? null
    };
}

function parseFechaMarcada(fecha: string): Date {
    if (!fecha) return new Date(''); // fallback
    // "29/05/2025 06:29"
    const [d, m, rest] = fecha.split('/');
    if (!rest) return new Date('');
    const [y, time] = rest.split(' ');
    return new Date(`${y}-${m}-${d}T${time || '00:00'}:00`);
}



export async function getMarcadasDelDia(
    departamento: string,
    fecha: string
): Promise<Array<Marcada>> {
    let startTime = new Date();
    await connection?.connect();

    return new Promise(async (resolve, reject) => {
        const rows: Array<Marcada> = [];
        const request = new sql.Request();

        const query = `USE ${Bun.env.DB}; SELECT * FROM MarcadasDelDia('${departamento}', '${fecha}');`;

        request.query(query);

        request.on('row', (row) => {
            processRow(row);
            rows.push(rowToMarcada(row));
        });

        request.on('error', (err) => {
            console.error('Error fetching data:', err);
            reject(err);
        });

        request.on('done', () => {
            let endTime = new Date();
            console.log("INFO db :: " + 'Tiempo de consulta MarcadaDelDia:', differenceInMilliseconds(endTime, startTime) + 'ms');
            console.log("INFO db :: " + rows.length + " registros encontrados");
            resolve(rows);
        });
    });
}

export async function getMarcadasEntreFechas(departamento: string, fechaInicial: string, fechaFinal: string): Promise<Array<Marcada>> {
    let startTime = new Date();
    await connection?.connect();

    return new Promise((resolve, reject) => {
        const rows: Array<Marcada> = [];
        const request = new sql.Request();
        request.stream = true;

        const query = `USE ${Bun.env.DB}; SELECT * FROM MarcadaEntreFechas('${departamento}', '${fechaInicial}', '${fechaFinal}');`;

        console.log('Query fetchMarcadaEntreFechas:', query);
        request.query(query);

        request.on('row', (row) => {
            processRow(row);
            rows.push(rowToMarcada(row));
        });

        request.on('error', (err) => {
            console.error('Error fetching data:', err);
            reject(err);
        });

        request.on('done', () => {
            let endTime = new Date();
            console.log("INFO db :: " + 'Tiempo de consulta MarcadaEntreFechas:', differenceInMilliseconds(endTime, startTime) + 'ms');
            console.log("INFO db :: " + rows.length + " registros encontrados");
            resolve(rows);
        });
    });
}

export async function getMarcadasEstandar(departamento: string, fecha: string): Promise<Array<Marcada>> {
  let startTime = new Date();
  const fechaHoy = new Date(fecha);

  // Calcular "ayer" (si es lunes, tomar viernes)
  let fechaAyer = new Date(fechaHoy);
  if (fechaHoy.getDay() === 0) { // Lunes
    console.log("INFO db :: MarcadasEstandar - Es lunes, tomando viernes como fecha de ayer");
    fechaAyer.setDate(fechaHoy.getDate() - 3); // viernes
  } else {
    fechaAyer.setDate(fechaHoy.getDate() - 1);
  }

  const fechaHoyStr = fechaHoy.toISOString().slice(0, 10);
  const fechaAyerStr = fechaAyer.toISOString().slice(0, 10);
  console.log("INFO db :: MarcadasEstandar - Fecha Ayer:", fechaAyerStr, "Fecha Hoy:", fechaHoyStr);

  // Si es lunes, también obtener marcadas del viernes
  let marcadasAyerPromise = getMarcadasDelDia(departamento, fechaAyerStr);
  let marcadasHoyPromise = getMarcadasDelDia(departamento, fechaHoyStr);

  const [marcadasAyer, marcadasHoy] = await Promise.all([
    marcadasAyerPromise,
    marcadasHoyPromise
  ]);

  // Agrupar por persona usando Personal.UID
  const agrupadasAyer = new Map<number, Marcada[]>();
  marcadasAyer.forEach(m => {
    const key = m.Personal?.UID;
    if (key == null) return;
    if (!agrupadasAyer.has(key)) agrupadasAyer.set(key, []);
    agrupadasAyer.get(key)!.push(m);
  });

  const agrupadasHoy = new Map<number, Marcada[]>();
  marcadasHoy.forEach(m => {
    const key = m.Personal?.UID;
    if (key == null) return;
    if (!agrupadasHoy.has(key)) agrupadasHoy.set(key, []);
    agrupadasHoy.get(key)!.push(m);
  });

  // Unir UIDs de personas
  const uids = new Set([...agrupadasAyer.keys(), ...agrupadasHoy.keys()]);
  const resultado: Marcada[] = [];
  uids.forEach(uid => {
    const marcadasDeAyer = agrupadasAyer.get(uid) || [];
    const marcadasDeHoy = agrupadasHoy.get(uid) || [];

    // Salida máxima de ayer (solo después de las 10:00)
    let salidaMax: string | null = null;
    if (marcadasDeAyer.length > 0) {
      const salidas = marcadasDeAyer
        .map(m => m.Marcada)
        .filter(Boolean)
        .filter(marcada => {
          const date = parseFechaMarcada(marcada as string);
          return date.getHours() >= 10; //ANCHOR - Solo salidas después de las 10:00
        }) as string[];
      if (salidas.length > 0) {
        salidaMax = salidas.reduce((max, curr) =>
          parseFechaMarcada(curr) > parseFechaMarcada(max) ? curr : max
        );
      }
    }

    // Entrada mínima de hoy (solo antes de las 10:00)
    let entradaMin: string | null = null;
    if (marcadasDeHoy.length > 0) {
      const entradas = marcadasDeHoy
        .map(m => m.Marcada)
        .filter(Boolean)
        .filter(marcada => {
          const date = parseFechaMarcada(marcada as string);
          return date.getHours() < 10; //ANCHOR - Solo entradas antes de las 10:00
        }) as string[];
      if (entradas.length > 0) {
        entradaMin = entradas.reduce((min, curr) =>
          parseFechaMarcada(curr) < parseFechaMarcada(min) ? curr : min
        );
      }
    }

    // Construir objeto Marcada para el día de hoy
    if (entradaMin) {
      const base = marcadasDeHoy.find(m => m.Marcada === entradaMin)!;
      resultado.push({
        ...base,
        Marcada: null,
        Entrada: entradaMin,
        Salida: salidaMax,
        Estado: salidaMax ? "Presente" : "Falta salida"
      });
    } else if (salidaMax) {
      const base = marcadasDeAyer.find(m => m.Marcada === salidaMax)!;
      resultado.push({
        ...base,
        Marcada: null,
        Entrada: null,
        Salida: salidaMax,
        Estado: "Falta entrada"
      });
    }
    else {
      // Si no hay marcadas ni de ayer ni de hoy, crea un objeto vacio
      const base = marcadasDeAyer[0] || marcadasDeHoy[0];
      resultado.push({
        LID: base?.LID ?? 0,
        Personal: base?.Personal ?? {
          UID: 0,
          MR: '',
          Nombre: '',
          Departamento: '',
          CUIL: '',
          Jornada: '',
          Activo: false,
          Foto: ''
        },
        Marcada: null,
        Entrada: null,
        Salida: null,
        Estado: "Ausente"
      });
    }
  });

  let endTime = new Date();
  console.log("INFO db :: Tiempo de consulta MarcadasEstandar:", differenceInMilliseconds(endTime, startTime) + 'ms');
  console.log("INFO db :: " + resultado.length + " registros encontrados");
  return resultado;
}

