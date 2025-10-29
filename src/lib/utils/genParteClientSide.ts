import type { Marcada } from '$lib/types/gen';
import { filtrarPersonalActivo } from '$lib/utils';
import ExcelJS from 'exceljs';
import { Buffer } from 'buffer';
import type { AppRouter } from '$lib/server/trpc/router';
import type { TRPCClient } from '@trpc/client';


export async function generateExcelFromTemplate(departamento: string, fecha: string, trpcClient: any): Promise<void> {
     console.time('generateExcelFromTemplate');
     let marcadas: Marcada[] = await trpcClient.marcadas.getMarcadas.query({
          departamento,
          fecha,
          funcion: 'estandar'
     });
     marcadas = filtrarPersonalActivo(marcadas);
     const Destino = 'ARSENAL NAVAL PUERTO BELGRANO';
     const templatePath = '/parte-template.xlsx';

     // Fetch departamento info
     const departamentos = await trpcClient.departamentos.getAll.query();
     const depto = departamentos.find((d: any) => d.DeptName === departamento);
     const selloJefeBase64 = depto?.SelloJefe || null;
     const leyendaJefe = depto?.leyendaJefe || '';

     const workbook = new ExcelJS.Workbook();

     // Fetch the template file as a binary blob
     const response = await fetch(templatePath);
     if (!response.ok) {
          throw new Error(`Failed to fetch template: ${response.statusText}`);
     }
     const arrayBuffer = await response.arrayBuffer();

     // Load the template into the workbook
     await workbook.xlsx.load(arrayBuffer);

     const worksheet = workbook.getWorksheet(1);
     if (!worksheet) {
          throw new Error('Worksheet not found in the template.');
     }

     let Ausentes = 0;
     for (const item of marcadas) {
          if (item.Estado !== 'Presente') Ausentes++;
     }
     const Departamento = departamento;
     const Presentes = marcadas.length - Ausentes;
     const fePermanente = marcadas.length;

     // Find the cell for selloJefe and leyendaJefe
     let selloJefeCell: ExcelJS.Cell | undefined;
     let leyendaJefeCell: ExcelJS.Cell | undefined;

     worksheet.eachRow((row) => {
          row.eachCell((cell) => {
               if (typeof cell.value === 'string') {
                    if (cell.value.includes('${selloJefe}')) {
                         selloJefeCell = cell;
                    }
                    if (cell.value.includes('${leyendaJefe}')) {
                         leyendaJefeCell = cell;
                    }
                    // Replace other placeholders
                    cell.value = cell.value
                         .replace('${fecha}', fecha)
                         .replace('${Destino}', Destino)
                         .replace('${Departamento}', Departamento)
                         .replace('${fePermanente}', fePermanente.toString())
                         .replace('${feAusente}', Ausentes.toString())
                         .replace('${fePresente}', Presentes.toString())
                         .replace('${leyendaJefe}', leyendaJefe);
               }
          });
     });

     // Insert selloJefe image if available
     if (selloJefeBase64 && selloJefeCell) {
          // Convert base64 to Uint8Array (compatible with ExcelJS in browser)
          const imageBuffer = Uint8Array.from(atob(selloJefeBase64), c => c.charCodeAt(0));

          const img = new window.Image();
          img.src = 'data:image/png;base64,' + selloJefeBase64;

          await new Promise<void>((resolve) => {
               img.onload = () => {
                    if (!selloJefeCell) {
                         resolve();
                         return;
                    }
                    const width = img.naturalWidth;
                    const height = img.naturalHeight;

                    const imageId = workbook.addImage({
                         buffer: imageBuffer as any,
                         extension: 'png',
                    });
                    worksheet.addImage(imageId, {
                         tl: {
                              col: Number(selloJefeCell.col) - 1,
                              row: Number(selloJefeCell.row) - 1
                         },
                         ext: { width, height }
                    });
                    selloJefeCell.value = '';
                    resolve();
               };
               img.onerror = () => {
                    if (!selloJefeCell) {
                         resolve();
                         return;
                    }
                    const imageId = workbook.addImage({
                         buffer: imageBuffer as any,
                         extension: 'png',
                    });
                    worksheet.addImage(imageId, {
                         tl: {
                              col: Number(selloJefeCell.col) - 1,
                              row: Number(selloJefeCell.row) - 1
                         },
                         ext: { width: 80, height: 80 }
                    });
                    selloJefeCell.value = '';
                    resolve();
               };
          });
     }

     // Find the row index where the table starts
     let tableStartRow = 6; // Adjust this to match the actual template row index

     // Insert rows dinámicamente: una fila para Entrada, otra para Salida
     marcadas.forEach((record: any, index: number) => {
          const rowIndexEntrada = tableStartRow + index * 2;
          const rowIndexSalida = rowIndexEntrada + 1;

          // Fila de Entrada
          worksheet.spliceRows(rowIndexEntrada, 0, []);
          const rowEntrada = worksheet.getRow(rowIndexEntrada);
          rowEntrada.getCell(1).value = record.Personal.Nombre;
          rowEntrada.getCell(2).value = record.Personal.MR;
          rowEntrada.getCell(3).value = record.Personal.CUIL;
          rowEntrada.getCell(4).value = 'Entrada';
          rowEntrada.getCell(5).value = record.Entrada;

          rowEntrada.eachCell((cell) => {
               cell.font = {
                    bold: record.bold || false,
                    name: 'Arial'
               };
               cell.alignment = { horizontal: 'center' };
          });
          rowEntrada.commit();

          // Fila de Salida
          worksheet.spliceRows(rowIndexSalida, 0, []);
          const rowSalida = worksheet.getRow(rowIndexSalida);
          rowSalida.getCell(1).value = record.Personal.Nombre;
          rowSalida.getCell(2).value = record.Personal.MR;
          rowSalida.getCell(3).value = record.Personal.CUIL;
          rowSalida.getCell(4).value = 'Salida';
          rowSalida.getCell(5).value = record.Salida;

          rowSalida.eachCell((cell) => {
               cell.font = {
                    bold: record.bold || false,
                    name: 'Arial'
               };
               cell.alignment = { horizontal: 'center' };
          });
          rowSalida.commit();
     });

     // Encuentra la columna de la celda original de selloJefe
     let selloJefeCol = 1;
     if (selloJefeCell) {
          selloJefeCol = Number(selloJefeCell.col);
     }

     // Calcula la fila destino para la imagen (después de las marcadas)
     const offsetExtra = 2; // Puedes ajustar este valor para dejar más espacio

     // Generate the Excel file as a Blob
     const buffer = await workbook.xlsx.writeBuffer();
     const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

     // Trigger download
     const link = document.createElement('a');
     link.href = URL.createObjectURL(blob);
     link.download = `Parte ${Departamento} ${fecha}.xlsx`;
     link.click();

     console.timeEnd('generateExcelFromTemplate');
}