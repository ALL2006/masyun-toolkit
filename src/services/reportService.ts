import { transactionService } from './transactionService';
import { categoryService } from './categoryService';
import { accountService } from './accountService';
import { ReportData, ReportOptions, Transaction } from '../types';

export class ReportService {
  // 生成报表数据
  async generateReport(options: ReportOptions): Promise<ReportData> {
    let startDate: string;
    let endDate: string;
    let title: string;

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    switch (options.type) {
      case 'monthly':
        const year = options.year || currentYear;
        const month = options.month || currentMonth;
        startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;
        title = `${year}年${month}月财务报表`;
        break;

      case 'yearly':
        const reportYear = options.year || currentYear;
        startDate = `${reportYear}-01-01`;
        endDate = `${reportYear}-12-31`;
        title = `${reportYear}年度财务报表`;
        break;

      case 'custom':
        startDate = options.startDate || '';
        endDate = options.endDate || '';
        title = `财务报表 (${startDate} 至 ${endDate})`;
        break;

      default:
        startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const lastDayDef = new Date(currentYear, currentMonth, 0).getDate();
        endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${lastDayDef}`;
        title = `${currentYear}年${currentMonth}月财务报表`;
    }

    const transactions = await transactionService.getTransactionsByDateRange(startDate, endDate);

    return {
      meta: {
        title,
        type: options.type,
        period: `${startDate} 至 ${endDate}`,
        generatedAt: new Date().toLocaleString('zh-CN')
      },
      summary: this.calculateSummary(transactions),
      categoryBreakdown: await this.calculateCategoryBreakdown(transactions),
      dailyBreakdown: this.calculateDailyBreakdown(transactions),
      accountBreakdown: await this.calculateAccountBreakdown(transactions)
    };
  }

  // 计算汇总信息
  private calculateSummary(transactions: Transaction[]): ReportData['summary'] {
    const income = transactions.filter(t => t.type === 'income');
    const expense = transactions.filter(t => t.type === 'expense');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expense.reduce((sum, t) => sum + t.amount, 0);
    const netIncome = totalIncome - totalExpense;

    // 按日期分组统计
    const dailyExpenses = new Map<string, number>();
    expense.forEach(t => {
      const current = dailyExpenses.get(t.date) || 0;
      dailyExpenses.set(t.date, current + t.amount);
    });

    // 找出支出最多的日期
    let maxExpenseDay = '';
    let maxExpenseAmount = 0;
    dailyExpenses.forEach((amount, date) => {
      if (amount > maxExpenseAmount) {
        maxExpenseAmount = amount;
        maxExpenseDay = date;
      }
    });

    // 计算日均支出
    const daysCount = dailyExpenses.size || 1;
    const avgDailyExpense = totalExpense / daysCount;

    return {
      totalIncome,
      totalExpense,
      netIncome,
      transactionCount: transactions.length,
      avgDailyExpense,
      maxExpenseDay,
      maxExpenseAmount
    };
  }

  // 计算分类明细
  private async calculateCategoryBreakdown(transactions: Transaction[]) {
    const categories = await categoryService.getAllCategories();
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));

    const breakdown = new Map<string, { income: number; expense: number; count: number }>();

    transactions.forEach(t => {
      const current = breakdown.get(t.category) || { income: 0, expense: 0, count: 0 };
      if (t.type === 'income') {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
      current.count++;
      breakdown.set(t.category, current);
    });

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return Array.from(breakdown.entries()).map(([categoryId, data]) => ({
      category: categoryMap.get(categoryId) || categoryId,
      income: data.income,
      expense: data.expense,
      transactionCount: data.count,
      percentage: totalExpense > 0 ? (data.expense / totalExpense) * 100 : 0
    }));
  }

  // 计算每日明细
  private calculateDailyBreakdown(transactions: Transaction[]) {
    const dailyMap = new Map<string, { income: number; expense: number; count: number }>();

    transactions.forEach(t => {
      const current = dailyMap.get(t.date) || { income: 0, expense: 0, count: 0 };
      if (t.type === 'income') {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
      current.count++;
      dailyMap.set(t.date, current);
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
        transactionCount: data.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // 计算账户明细
  private async calculateAccountBreakdown(transactions: Transaction[]) {
    const accounts = await accountService.getAllAccounts();
    const accountMap = new Map(accounts.map(a => [a.id, a.name]));

    const breakdown = new Map<string, { income: number; expense: number }>();

    transactions.forEach(t => {
      const accountId = t.accountId || 'default';
      const current = breakdown.get(accountId) || { income: 0, expense: 0 };
      if (t.type === 'income') {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }
      breakdown.set(accountId, current);
    });

    return Array.from(breakdown.entries()).map(([accountId, data]) => ({
      accountId,
      accountName: accountMap.get(accountId) || accountId,
      income: data.income,
      expense: data.expense,
      currentBalance: accounts.find(a => a.id === accountId)?.balance || 0
    }));
  }
}

export const reportService = new ReportService();
