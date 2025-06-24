import type { Marcada } from '$lib/types/gen';
import { fetchMarcadas } from '$lib/apiController/marcadasApi';
import { fetchDepartamentos } from '$lib/apiController/departamentosApi'; // <-- Import this
import { filtrarPersonalActivo } from '$lib/utils';
import ExcelJS from 'exceljs';


export async function generateExcelFromTemplate(departamento: string, fecha: string): Promise<void> {
     console.time('generateExcelFromTemplate');
     let marcadas: Marcada[] = await fetchMarcadas(departamento, fecha, 'estandar');
     marcadas = filtrarPersonalActivo(marcadas);
     const Destino = 'ARSENAL NAVAL PUERTO BELGRANO';
     const templatePath = '/parte-template.xlsx';

     // Fetch departamento info
     const departamentos = await fetchDepartamentos();
     const depto = departamentos.find(d => d.DeptName === departamento);
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
          // Convert base64 to buffer
          const imageBuffer = typeof Buffer !== 'undefined'
               ? Buffer.from(selloJefeBase64, 'base64')
               : Uint8Array.from(atob(selloJefeBase64), c => c.charCodeAt(0)); // fallback for browsers

          const imageId = workbook.addImage({
               buffer: imageBuffer as any,
               extension: 'png', // or 'jpeg' depending on your image type
          });
          worksheet.addImage(imageId, {
               tl: { 
                    col: Number(selloJefeCell.col) - 1, 
                    row: Number(selloJefeCell.row) - 1 
               },
               ext: { width: 80, height: 80 } // Adjust size as needed
          });
          // Optionally clear the placeholder text
          (selloJefeCell as ExcelJS.Cell).value = '';
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