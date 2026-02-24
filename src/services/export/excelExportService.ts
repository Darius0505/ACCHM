// Excel Export Service
// Using exceljs library for professional Excel generation

import ExcelJS from 'exceljs';
import { ReportTemplateConfig, ReportColumn, ExcelStyleOptions } from '@/types/reportTemplate';

// ============================================================================
// TYPES
// ============================================================================

export interface CompanyInfo {
    name: string;
    nameEN?: string;
    address?: string;
    taxCode?: string;
    phone?: string;
    email?: string;
}

export interface ExportParams {
    template: ReportTemplateConfig;
    data: Record<string, unknown>[];
    companyInfo: CompanyInfo;
    reportPeriod: {
        type: 'asOf' | 'range';
        asOfDate?: Date;
        fromDate?: Date;
        toDate?: Date;
    };
    language?: 'vi' | 'en';
}

// ============================================================================
// HELPERS
// ============================================================================

const formatVietnameseDate = (date: Date): string => {
    return `Ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
};

const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value);
};

const getColumnLetter = (index: number): string => {
    let letter = '';
    let num = index + 1;
    while (num > 0) {
        const remainder = (num - 1) % 26;
        letter = String.fromCharCode(65 + remainder) + letter;
        num = Math.floor((num - 1) / 26);
    }
    return letter;
};

// ============================================================================
// STYLE HELPERS
// ============================================================================

const applyHeaderStyle = (
    row: ExcelJS.Row,
    style: ExcelStyleOptions,
    columnCount: number
): void => {
    row.height = 30;
    row.eachCell((cell, colNumber) => {
        if (colNumber <= columnCount) {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: (style.headerBgColor || '#1E3A8A').replace('#', '') }
            };
            cell.font = {
                bold: true,
                color: { argb: (style.headerFontColor || '#FFFFFF').replace('#', '') },
                size: style.fontSize || 11,
                name: style.fontFamily || 'Times New Roman'
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
                top: { style: style.borderStyle || 'thin' },
                left: { style: style.borderStyle || 'thin' },
                bottom: { style: style.borderStyle || 'thin' },
                right: { style: style.borderStyle || 'thin' }
            };
        }
    });
};

const applyDataRowStyle = (
    row: ExcelJS.Row,
    style: ExcelStyleOptions,
    columns: ReportColumn[],
    isAlternate: boolean,
    rowData: Record<string, unknown>
): void => {
    row.height = 22;
    row.eachCell((cell, colNumber) => {
        const colDef = columns[colNumber - 1];
        if (!colDef) return;

        // Background
        if (isAlternate && style.alternatRowColor) {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: style.alternatRowColor.replace('#', '') }
            };
        }

        // Font
        cell.font = {
            bold: colDef.isBold || colDef.isTotal || false,
            italic: colDef.isItalic || false,
            size: style.fontSize || 11,
            name: style.fontFamily || 'Times New Roman'
        };

        // Alignment
        cell.alignment = {
            vertical: 'middle',
            horizontal: colDef.align || 'left',
            indent: colDef.indent || 0
        };

        // Border
        cell.border = {
            top: { style: style.borderStyle || 'thin' },
            left: { style: style.borderStyle || 'thin' },
            bottom: { style: style.borderStyle || 'thin' },
            right: { style: style.borderStyle || 'thin' }
        };

        // Number formatting
        if (colDef.type === 'currency') {
            cell.numFmt = '#,##0';
        } else if (colDef.type === 'number') {
            cell.numFmt = colDef.format || '#,##0';
        } else if (colDef.type === 'percentage') {
            cell.numFmt = '#,##0.00%';
        }
    });
};

// ============================================================================
// MAIN EXPORT FUNCTION
// ============================================================================

export async function exportToExcel(params: ExportParams): Promise<ExcelJS.Buffer> {
    const { template, data, companyInfo, reportPeriod, language = 'vi' } = params;
    const { header, columns, export: exportOpts } = template;
    const style = exportOpts.style || {};

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ACCHM ERP';
    workbook.created = new Date();

    // Create worksheet
    const worksheet = workbook.addWorksheet(exportOpts.sheetName || 'Report', {
        pageSetup: {
            paperSize: (exportOpts.paperSize === 'A3' ? 8 : 9) as any, // A4 = 9
            orientation: exportOpts.orientation || 'portrait',
            margins: {
                top: (exportOpts.margins?.top || 20) / 25.4, // Convert mm to inches
                bottom: (exportOpts.margins?.bottom || 20) / 25.4,
                left: (exportOpts.margins?.left || 20) / 25.4,
                right: (exportOpts.margins?.right || 20) / 25.4,
                header: 0.3,
                footer: 0.3
            }
        }
    });

    let currentRow = 1;
    const columnCount = columns.filter(c => !c.hidden).length;
    const lastColLetter = getColumnLetter(columnCount - 1);

    // =========================================================================
    // HEADER SECTION
    // =========================================================================

    if (header.showCompanyInfo) {
        // Company name
        worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
        const companyCell = worksheet.getCell(`A${currentRow}`);
        companyCell.value = companyInfo.name.toUpperCase();
        companyCell.font = { bold: true, size: 14, name: 'Times New Roman' };
        companyCell.alignment = { horizontal: 'center' };
        currentRow++;

        // Address
        if (companyInfo.address) {
            worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
            const addressCell = worksheet.getCell(`A${currentRow}`);
            addressCell.value = companyInfo.address;
            addressCell.font = { size: 11, name: 'Times New Roman' };
            addressCell.alignment = { horizontal: 'center' };
            currentRow++;
        }

        currentRow++; // Empty row
    }

    // Report title
    worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
    const titleCell = worksheet.getCell(`A${currentRow}`);
    titleCell.value = language === 'vi' ? header.title : (header.titleEN || header.title);
    titleCell.font = { bold: true, size: 16, name: 'Times New Roman' };
    titleCell.alignment = { horizontal: 'center' };
    currentRow++;

    // VAS reference
    if (header.vasCode) {
        worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
        const vasCodeCell = worksheet.getCell(`A${currentRow}`);
        vasCodeCell.value = header.vasCode;
        vasCodeCell.font = { italic: true, size: 11, name: 'Times New Roman' };
        vasCodeCell.alignment = { horizontal: 'center' };
        currentRow++;
    }

    if (header.vasReference) {
        worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
        const vasRefCell = worksheet.getCell(`A${currentRow}`);
        vasRefCell.value = header.vasReference;
        vasRefCell.font = { italic: true, size: 10, name: 'Times New Roman' };
        vasRefCell.alignment = { horizontal: 'center' };
        currentRow++;
    }

    // Period info
    let periodText = '';
    if (reportPeriod.type === 'asOf' && reportPeriod.asOfDate) {
        periodText = `Tại ngày ${formatVietnameseDate(reportPeriod.asOfDate)}`;
    } else if (reportPeriod.fromDate && reportPeriod.toDate) {
        periodText = `Từ ngày ${formatVietnameseDate(reportPeriod.fromDate)} đến ngày ${formatVietnameseDate(reportPeriod.toDate)}`;
    }

    if (periodText) {
        worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
        const periodCell = worksheet.getCell(`A${currentRow}`);
        periodCell.value = periodText;
        periodCell.font = { italic: true, size: 11, name: 'Times New Roman' };
        periodCell.alignment = { horizontal: 'center' };
        currentRow++;
    }

    // Unit
    worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
    const unitCell = worksheet.getCell(`A${currentRow}`);
    unitCell.value = 'Đơn vị tính: VNĐ';
    unitCell.font = { italic: true, size: 10, name: 'Times New Roman' };
    unitCell.alignment = { horizontal: 'right' };
    currentRow++;

    currentRow++; // Empty row before table

    // =========================================================================
    // TABLE HEADER
    // =========================================================================

    const visibleColumns = columns.filter(c => !c.hidden);
    const headerRow = worksheet.getRow(currentRow);

    visibleColumns.forEach((col, index) => {
        const cell = headerRow.getCell(index + 1);
        cell.value = language === 'vi' ? col.headerName : (col.headerNameEN || col.headerName);

        // Set column width
        const colObj = worksheet.getColumn(index + 1);
        if (col.width) {
            colObj.width = col.width / 7; // Approximate conversion to Excel units
        } else if (col.minWidth) {
            colObj.width = col.minWidth / 7;
        } else {
            colObj.width = 15;
        }
    });

    applyHeaderStyle(headerRow, style, columnCount);
    currentRow++;

    // =========================================================================
    // DATA ROWS
    // =========================================================================

    data.forEach((rowData, rowIndex) => {
        const dataRow = worksheet.getRow(currentRow);

        visibleColumns.forEach((col, colIndex) => {
            const cell = dataRow.getCell(colIndex + 1);
            const value = rowData[col.field];

            if (col.type === 'currency' || col.type === 'number') {
                cell.value = typeof value === 'number' ? value : 0;
            } else {
                cell.value = value as string;
            }
        });

        applyDataRowStyle(dataRow, style, visibleColumns, rowIndex % 2 === 1, rowData);
        currentRow++;
    });

    // =========================================================================
    // FOOTER / SIGNATURES
    // =========================================================================

    if (template.footer?.showSignatures) {
        currentRow += 2;

        // Date line (right)
        const today = new Date();
        const dateLine = `........, ${formatVietnameseDate(today)}`;
        worksheet.mergeCells(`A${currentRow}:${lastColLetter}${currentRow}`);
        const dateCell = worksheet.getCell(`A${currentRow}`);
        dateCell.value = dateLine;
        dateCell.font = { italic: true, size: 11, name: 'Times New Roman' };
        dateCell.alignment = { horizontal: 'right' };
        currentRow += 2;

        // Signature titles
        const sigRow = worksheet.getRow(currentRow);
        const sigTitles = ['Người lập biểu', 'Kế toán trưởng', 'Giám đốc'];
        const sigPositions = [1, Math.floor(columnCount / 2), columnCount];

        sigTitles.forEach((title, i) => {
            const cell = sigRow.getCell(sigPositions[i]);
            cell.value = title;
            cell.font = { bold: true, size: 11, name: 'Times New Roman' };
            cell.alignment = { horizontal: 'center' };
        });
        currentRow++;

        // Signature note
        const noteRow = worksheet.getRow(currentRow);
        const sigNotes = ['(Ký, họ tên)', '(Ký, họ tên)', '(Ký, họ tên, đóng dấu)'];

        sigNotes.forEach((note, i) => {
            const cell = noteRow.getCell(sigPositions[i]);
            cell.value = note;
            cell.font = { italic: true, size: 10, name: 'Times New Roman' };
            cell.alignment = { horizontal: 'center' };
        });
    }

    // =========================================================================
    // GENERATE BUFFER
    // =========================================================================

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ExcelJS.Buffer;
}

// ============================================================================
// SIMPLIFIED EXPORT FOR CLIENT-SIDE
// ============================================================================

export interface SimpleExportParams {
    title: string;
    columns: { header: string; key: string; width?: number }[];
    data: Record<string, unknown>[];
    fileName?: string;
}

export async function simpleExportToExcel(params: SimpleExportParams): Promise<ExcelJS.Buffer> {
    const { title, columns, data, fileName } = params;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(fileName || 'Report');

    // Title
    worksheet.mergeCells(1, 1, 1, columns.length);
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center' };

    // Header
    const headerRow = worksheet.getRow(3);
    columns.forEach((col, index) => {
        headerRow.getCell(index + 1).value = col.header;
        worksheet.getColumn(index + 1).width = col.width || 15;
    });
    headerRow.font = { bold: true };
    headerRow.eachCell(cell => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1E3A8A' }
        };
        cell.font = { bold: true, color: { argb: 'FFFFFF' } };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Data
    let rowNum = 4;
    data.forEach((item) => {
        const row = worksheet.getRow(rowNum);
        columns.forEach((col, colIndex) => {
            row.getCell(colIndex + 1).value = item[col.key] as ExcelJS.CellValue;
        });
        row.eachCell(cell => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });
        rowNum++;
    });

    return await workbook.xlsx.writeBuffer() as ExcelJS.Buffer;
}
