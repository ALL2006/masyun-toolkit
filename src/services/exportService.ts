import * as XLSX from 'xlsx';
import { Filesystem, Directory } from '@capacitor/filesystem';
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

  // 检查是否在移动端（Capacitor 环境）
  private isCapacitor(): boolean {
    return !!(window as any).Capacitor;
  }

  // 将 Blob 转换为 Base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // 移动端保存文件
  private async saveFileMobile(blob: Blob, filename: string): Promise<{ path: string; uri: string }> {
    try {
      const base64 = await this.blobToBase64(blob);

      // 检查并创建目录
      const dirPath = '大学生记账本';
      try {
        await Filesystem.mkdir({
          path: dirPath,
          directory: Directory.Documents,
          recursive: false
        });
      } catch (e) {
        // 目录可能已存在，忽略错误
      }

      // 保存文件到 Documents/大学生记账本/
      const filePath = `${dirPath}/${filename}`;
      await Filesystem.writeFile({
        path: filePath,
        data: base64,
        directory: Directory.Documents,
        recursive: true
      });

      // 获取文件的 URI，用于打开文件
      const uriResult = await Filesystem.getUri({
        path: filePath,
        directory: Directory.Documents
      });

      return {
        path: filePath,
        uri: uriResult.uri
      };
    } catch (error) {
      console.error('保存文件失败:', error);
      throw new Error('文件保存失败');
    }
  }

  // 桌面端下载文件
  private downloadFileDesktop(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // 导出并下载 Excel（自动检测平台）
  // 返回值：移动端返回文件路径和URI，桌面端返回 null
  async exportAndDownloadExcel(reportData: ReportData): Promise<{ path?: string; uri?: string } | null> {
    const blob = await this.exportToExcel(reportData);
    const filename = `${reportData.meta.title}_${new Date().toISOString().split('T')[0]}.xlsx`;

    if (this.isCapacitor()) {
      // 移动端：保存到 Documents 目录
      const result = await this.saveFileMobile(blob, filename);
      return result;
    } else {
      // 桌面端：使用浏览器下载
      this.downloadFileDesktop(blob, filename);
      return null;
    }
  }
}

export const exportService = new ExportService();
