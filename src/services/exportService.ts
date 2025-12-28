import * as XLSX from 'xlsx';
import { ReportData } from '../types';

export class ExportService {
  // 导出为 Excel
  async exportToExcel(reportData: ReportData): Promise<Blob> {
    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 汇总表
    const summaryData = [
      ['报表标题', reportData.meta.title],
      ['统计周期', reportData.meta.period],
      ['生成时间', reportData.meta.generatedAt],
      [''],
      ['总收入', `¥${reportData.summary.totalIncome.toFixed(2)}`],
      ['总支出', `¥${reportData.summary.totalExpense.toFixed(2)}`],
      ['净收入', `¥${reportData.summary.netIncome.toFixed(2)}`],
      ['交易笔数', reportData.summary.transactionCount],
      ['日均支出', `¥${reportData.summary.avgDailyExpense.toFixed(2)}`],
      ['最高支出日', reportData.summary.maxExpenseDay],
      ['最高支出金额', `¥${reportData.summary.maxExpenseAmount.toFixed(2)}`]
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, '汇总');

    // 分类明细表
    const categoryData = [
      ['分类', '收入', '支出', '交易次数', '支出占比']
    ];
    reportData.categoryBreakdown.forEach(item => {
      categoryData.push([
        item.category,
        item.income.toFixed(2),
        item.expense.toFixed(2),
        item.transactionCount.toString(),
        `${item.percentage.toFixed(1)}%`
      ]);
    });
    const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, '分类明细');

    // 每日明细表
    const dailyData = [
      ['日期', '收入', '支出', '净收支', '交易次数']
    ];
    reportData.dailyBreakdown.forEach(item => {
      dailyData.push([
        item.date,
        item.income.toFixed(2),
        item.expense.toFixed(2),
        item.net.toFixed(2),
        item.transactionCount.toString()
      ]);
    });
    const dailySheet = XLSX.utils.aoa_to_sheet(dailyData);
    XLSX.utils.book_append_sheet(workbook, dailySheet, '每日明细');

    // 账户明细表
    const accountData = [
      ['账户', '收入', '支出', '当前余额']
    ];
    reportData.accountBreakdown.forEach(item => {
      accountData.push([
        item.accountName,
        item.income.toFixed(2),
        item.expense.toFixed(2),
        item.currentBalance.toFixed(2)
      ]);
    });
    const accountSheet = XLSX.utils.aoa_to_sheet(accountData);
    XLSX.utils.book_append_sheet(workbook, accountSheet, '账户明细');

    // 生成二进制数据
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // 下载文件
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // 导出并下载 Excel
  async exportAndDownloadExcel(reportData: ReportData): Promise<void> {
    const blob = await this.exportToExcel(reportData);
    const filename = `${reportData.meta.title}_${new Date().toISOString().split('T')[0]}.xlsx`;
    this.downloadBlob(blob, filename);
  }
}

export const exportService = new ExportService();
