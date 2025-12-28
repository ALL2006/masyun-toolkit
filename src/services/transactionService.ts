import { db } from '../db/database';
import { Transaction, Statistics, CategoryStat, Account } from '../types';

export class TransactionService {
  // 生成唯一ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 更新账户余额
  private async updateAccountBalance(accountId: string, amount: number, type: 'income' | 'expense'): Promise<void> {
    const account = await db.accounts.get(accountId);
    if (!account) return;

    const balanceChange = type === 'income' ? amount : -amount;
    const newBalance = account.balance + balanceChange;

    await db.accounts.update(accountId, {
      balance: newBalance,
      updatedAt: new Date().toISOString()
    });
  }

  // 添加交易记录
  async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 获取账户名称（如果未提供）
    if (!newTransaction.accountName) {
      const account = await db.accounts.get(newTransaction.accountId);
      newTransaction.accountName = account?.name || '未知账户';
    }

    await db.transactions.add(newTransaction);

    // 更新账户余额
    await this.updateAccountBalance(newTransaction.accountId, newTransaction.amount, newTransaction.type);

    return newTransaction;
  }

  // 获取所有交易记录
  async getAllTransactions(): Promise<Transaction[]> {
    return await db.transactions.orderBy('date').reverse().toArray();
  }

  // 获取最近的交易记录
  async getRecentTransactions(limit: number = 5): Promise<Transaction[]> {
    return await db.transactions
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray();
  }

  // 获取指定日期范围内的交易记录
  async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return await db.transactions
      .where('date')
      .between(startDate, endDate)
      .toArray();
  }

  // 获取统计数据
  async getStatistics(startDate: string, endDate: string): Promise<Statistics> {
    const transactions = await this.getTransactionsByDateRange(startDate, endDate);
    return this.calculateStatistics(transactions);
  }

  // 计算统计数据
  private calculateStatistics(transactions: Transaction[]): Statistics {
    const income = transactions.filter(t => t.type === 'income');
    const expense = transactions.filter(t => t.type === 'expense');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expense.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // 分类统计
    const categoryMap = new Map<string, number>();
    expense.forEach(t => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });

    const categoryStats: CategoryStat[] = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
    }));

    return {
      totalIncome,
      totalExpense,
      balance,
      categoryStats
    };
  }

  // 删除交易记录
  async deleteTransaction(id: string): Promise<void> {
    const transaction = await db.transactions.get(id);
    if (!transaction) return;

    await db.transactions.delete(id);

    // 恢复账户余额
    await this.updateAccountBalance(transaction.accountId, transaction.amount, transaction.type === 'income' ? 'expense' : 'income');
  }

  // 导出数据
  async exportData(): Promise<string> {
    const transactions = await db.transactions.toArray();
    const categories = await db.categories.toArray();
    const accounts = await db.accounts.toArray();
    return JSON.stringify({ transactions, categories, accounts }, null, 2);
  }

  // 导入数据
  async importData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);

    // 清空现有数据
    await db.transactions.clear();

    // 导入新数据
    if (data.transactions && Array.isArray(data.transactions)) {
      // 为没有 accountId 的旧数据设置默认值
      const transactions = data.transactions.map((t: any) => ({
        ...t,
        accountId: t.accountId || 'default',
        accountName: t.accountName || '默认账户'
      }));
      await db.transactions.bulkAdd(transactions);
    }

    if (data.categories && Array.isArray(data.categories)) {
      await db.categories.clear();
      await db.categories.bulkAdd(data.categories);
    }

    if (data.accounts && Array.isArray(data.accounts)) {
      await db.accounts.clear();
      await db.accounts.bulkAdd(data.accounts);
    }

    // 重新计算所有账户余额
    await this.recalculateAllAccountBalances();
  }

  // 重新计算所有账户余额
  private async recalculateAllAccountBalances(): Promise<void> {
    const accounts = await db.accounts.toArray();

    for (const account of accounts) {
      const transactions = await db.transactions
        .where('accountId')
        .equals(account.id)
        .toArray();

      let balance = account.initialBalance;

      for (const t of transactions) {
        if (t.type === 'income') {
          balance += t.amount;
        } else {
          balance -= t.amount;
        }
      }

      await db.accounts.update(account.id, {
        balance,
        updatedAt: new Date().toISOString()
      });
    }
  }

  // 清空所有数据
  async clearAllData(): Promise<void> {
    await db.transactions.clear();
    // 重置所有账户余额为初始余额
    const accounts = await db.accounts.toArray();
    for (const account of accounts) {
      await db.accounts.update(account.id, {
        balance: account.initialBalance,
        updatedAt: new Date().toISOString()
      });
    }
  }
}

export const transactionService = new TransactionService();