import type { Marcada } from '$lib/types/gen';
import ExcelJS from 'exceljs';

export async function downloadExcel(data: Array<Marcada>, fileName = 'marcada', marcadasIntermedias = false) {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn("No hay datos para exportar a Excel");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Datos');

  // Define columns
  const columns = [
    { header: 'M.R', key: 'MR', width: 10 },
    { header: 'CUIL', key: 'CUIL', width: 15 },
    { header: 'Nombre', key: 'Nombre', width: 25 },
    { header: 'CAUSA', key: 'CAUSA', width: 15 },
    { header: 'COD AUS', key: 'COD_AUS', width: 10 },
    { header: 'Horas', key: 'Horas', width: 10 },
    { header: 'Observaciones', key: 'Observaciones', width: 20 },
    marcadasIntermedias
      ? { header: 'Marcada', key: 'Marcada', width: 15 }
      : { header: 'Entrada', key: 'Entrada', width: 15 },
    !marcadasIntermedias && { header: 'Salida', key: 'Salida', width: 15 }
  ].filter(Boolean) as ExcelJS.Column[];

  worksheet.columns = columns;

  // Add rows
  data.forEach(row => {
    worksheet.addRow({
      MR: row.Personal.MR,
      CUIL: row.Personal.CUIL,
      Nombre: row.Personal.Nombre,
      CAUSA: '',
      COD_AUS: '',
      Horas: '',
      Observaciones: '',
      Marcada: marcadasIntermedias ? (row.Marcada || '') : undefined,
      Entrada: !marcadasIntermedias ? row.Entrada : undefined,
      Salida: !marcadasIntermedias ? row.Salida : undefined,
    });
  });

  // Set header row bold
  worksheet.getRow(1).font = { bold: true };

  // Generate Excel file as Blob and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.xlsx`;
  link.click();

  window.URL.revokeObjectURL(url);
}