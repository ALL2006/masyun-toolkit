import { db } from '../db/database';
import { Budget, BudgetExecution } from '../types';
import { transactionService } from './transactionService';

export class BudgetService {
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 设置预算
  async setBudget(
    categoryId: string,
    categoryName: string,
    amount: number,
    year: number,
    month: number,
    alertThreshold = 80
  ): Promise<Budget> {
    // 检查是否已存在该分类该月的预算
    const existing = await db.budgets
      .where('[categoryId+year+month]')
      .equals([categoryId, year, month])
      .first();

    const budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'> = {
      categoryId,
      categoryName,
      amount,
      period: 'monthly',
      year,
      month,
      alertThreshold,
      isActive: true
    };

    if (existing) {
      await db.budgets.update(existing.id, {
        ...budgetData,
        updatedAt: new Date().toISOString()
      });
      return { ...existing, ...budgetData } as Budget;
    } else {
      const newBudget: Budget = {
        ...budgetData,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.budgets.add(newBudget);
      return newBudget;
    }
  }

  // 获取指定月份的预算列表
  async getMonthlyBudgets(year: number, month: number): Promise<Budget[]> {
    const budgets = await db.budgets.toArray();
    return budgets.filter(b => b.year === year && b.month === month && b.isActive);
  }

  // 计算预算执行情况
  async getBudgetExecution(year: number, month: number): Promise<BudgetExecution[]> {
    const budgets = await this.getMonthlyBudgets(year, month);

    // 获取该月的所有支出
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const transactions = await transactionService.getTransactionsByDateRange(startDate, endDate);
    const expenses = transactions.filter(t => t.type === 'expense');

    // 计算每个预算的执行情况
    const executions: BudgetExecution[] = await Promise.all(
      budgets.map(async (budget) => {
        const categoryExpenses = expenses.filter(t => t.category === budget.categoryId);
        const spentAmount = categoryExpenses.reduce((sum, t) => sum + t.amount, 0);
        const remainingAmount = budget.amount - spentAmount;
        const percentage = (spentAmount / budget.amount) * 100;

        // 计算日均支出和预计支出
        const now = new Date();
        const daysInMonth = lastDay;
        const currentDay = (now.getMonth() + 1 === month && now.getFullYear() === year)
          ? now.getDate()
          : daysInMonth;
        const daysRemaining = daysInMonth - currentDay;
        const dailyAverage = spentAmount / currentDay;
        const projectedSpending = dailyAverage * daysInMonth;

        // 确定状态
        let status: 'normal' | 'warning' | 'exceeded';
        if (percentage >= 100) {
          status = 'exceeded';
        } else if (percentage >= budget.alertThreshold) {
          status = 'warning';
        } else {
          status = 'normal';
        }

        return {
          budgetId: budget.id,
          categoryId: budget.categoryId,
          categoryName: budget.categoryName,
          budgetAmount: budget.amount,
          spentAmount,
          remainingAmount,
          percentage,
          status,
          dailyAverage,
          projectedSpending,
          daysRemaining
        };
      })
    );

    return executions;
  }

  // 获取超支预警列表
  async getOverBudgetAlerts(year: number, month: number): Promise<BudgetExecution[]> {
    const executions = await this.getBudgetExecution(year, month);
    return executions.filter(e => e.status === 'exceeded' || e.status === 'warning');
  }

  // 获取单个预算
  async getBudget(id: string): Promise<Budget | undefined> {
    return await db.budgets.get(id);
  }

  // 删除预算
  async deleteBudget(budgetId: string): Promise<void> {
    await db.budgets.delete(budgetId);
  }

  // 更新预算
  async updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
    await db.budgets.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  // 获取预算汇总
  async getBudgetSummary(year: number, month: number): Promise<{
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    budgetCount: number;
    overBudgetCount: number;
    warningCount: number;
  }> {
    const executions = await this.getBudgetExecution(year, month);

    const totalBudget = executions.reduce((sum, e) => sum + e.budgetAmount, 0);
    const totalSpent = executions.reduce((sum, e) => sum + e.spentAmount, 0);
    const totalRemaining = executions.reduce((sum, e) => sum + e.remainingAmount, 0);
    const overBudgetCount = executions.filter(e => e.status === 'exceeded').length;
    const warningCount = executions.filter(e => e.status === 'warning').length;

    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      budgetCount: executions.length,
      overBudgetCount,
      warningCount
    };
  }
}

export const budgetService = new BudgetService();
