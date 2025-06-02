import {connection} from './db';

import * as fs from 'fs/promises';
import * as path from 'path';

async function runAllSqlFilesInFolder(folderPath: string) {
    try {
        const files = await fs.readdir(folderPath);
        const sqlFiles = files.filter(file => file.endsWith('.sql'));

        const pool = await connection.connect();

        for (const file of sqlFiles) {
            const filePath = path.join(folderPath, file);
            const sql = await fs.readFile(filePath, 'utf8');
            console.log(`Ejecutando: ${file}`);
            await pool.request().batch(sql);
            console.log(`Ejecutado correctamente: ${file}`);
        }

        await pool.close();
        console.log('Todos los archivos SQL ejecutados.');
    } catch (err) {
        console.error('Error ejecutando archivos SQL:', err);
    }
}

// Cambia la ruta si es necesario
//runAllSqlFilesInFolder(path.resolve(__dirname, '../../../sql'));