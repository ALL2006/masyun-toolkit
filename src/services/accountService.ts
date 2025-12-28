import { db } from '../db/database';
import { Account, AccountTransfer, AccountType } from '../types';

export class AccountService {
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 账户类型配置
  private accountTypeConfig: Record<AccountType, { icon: string; color: string; label: string }> = {
    cash: { icon: '💵', color: '#52C41A', label: '现金' },
    bank_card: { icon: '💳', color: '#1890FF', label: '银行卡' },
    alipay: { icon: '💙', color: '#1890FF', label: '支付宝' },
    wechat: { icon: '💚', color: '#52C41A', label: '微信支付' },
    credit_card: { icon: '💳', color: '#FA541C', label: '信用卡' },
    other: { icon: '📦', color: '#95A5A6', label: '其他' }
  };

  // 获取账户类型配置
  getAccountTypeConfig(type: AccountType) {
    return this.accountTypeConfig[type];
  }

  // 获取所有账户类型
  getAccountTypes(): Array<{ type: AccountType; icon: string; color: string; label: string }> {
    return Object.entries(this.accountTypeConfig).map(([type, config]) => ({
      type: type as AccountType,
      ...config
    }));
  }

  // 获取所有账户
  async getAllAccounts(): Promise<Account[]> {
    const accounts = await db.accounts.toArray();
    return accounts
      .filter(a => a.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  // 获取单个账户
  async getAccount(id: string): Promise<Account | undefined> {
    return await db.accounts.get(id);
  }

  // 添加账户
  async addAccount(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    // 获取最大排序号
    const accounts = await this.getAllAccounts();
    const maxSortOrder = accounts.length > 0 ? Math.max(...accounts.map(a => a.sortOrder)) : -1;

    const newAccount: Account = {
      ...account,
      id: this.generateId(),
      sortOrder: account.sortOrder !== undefined ? account.sortOrder : maxSortOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.accounts.add(newAccount);
    return newAccount;
  }

  // 更新账户
  async updateAccount(id: string, updates: Partial<Account>): Promise<void> {
    await db.accounts.update(id, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  // 删除账户（软删除）
  async deleteAccount(id: string): Promise<void> {
    // 检查是否有关联交易
    const transactions = await db.transactions.where('accountId').equals(id).toArray();
    if (transactions.length > 0) {
      throw new Error('该账户有关联交易记录，无法删除');
    }

    await db.accounts.update(id, {
      isActive: false,
      updatedAt: new Date().toISOString()
    });
  }

  // 调整账户余额
  async adjustBalance(accountId: string, newBalance: number, reason?: string): Promise<void> {
    const account = await db.accounts.get(accountId);
    if (!account) throw new Error('账户不存在');

    const oldBalance = account.balance;
    const changeAmount = newBalance - oldBalance;

    await db.accounts.update(accountId, {
      balance: newBalance,
      updatedAt: new Date().toISOString()
    });

    // 可选：创建余额调整记录
    // 这里可以扩展为创建一个特殊的交易记录来追踪余额调整
  }

  // 设置账户初始余额
  async setInitialBalance(accountId: string, initialBalance: number): Promise<void> {
    const account = await db.accounts.get(accountId);
    if (!account) throw new Error('账户不存在');

    const balanceDiff = initialBalance - account.initialBalance;
    const newBalance = account.balance + balanceDiff;

    await db.accounts.update(accountId, {
      initialBalance,
      balance: newBalance,
      updatedAt: new Date().toISOString()
    });
  }

  // 重新计算账户余额
  async recalculateBalance(accountId: string): Promise<number> {
    const account = await db.accounts.get(accountId);
    if (!account) throw new Error('账户不存在');

    const transactions = await db.transactions
      .where('accountId')
      .equals(accountId)
      .toArray();

    let balance = account.initialBalance;

    transactions.forEach(t => {
      if (t.type === 'income') {
        balance += t.amount;
      } else if (t.type === 'expense') {
        balance -= t.amount;
      }
    });

    await db.accounts.update(accountId, {
      balance,
      updatedAt: new Date().toISOString()
    });

    return balance;
  }

  // 账户转账
  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    fee = 0,
    description?: string
  ): Promise<AccountTransfer> {
    // 验证账户存在
    const fromAccount = await db.accounts.get(fromAccountId);
    const toAccount = await db.accounts.get(toAccountId);

    if (!fromAccount || !toAccount) {
      throw new Error('账户不存在');
    }

    if (fromAccountId === toAccountId) {
      throw new Error('转出账户和转入账户不能相同');
    }

    const totalAmount = amount + fee;
    if (fromAccount.balance < totalAmount) {
      throw new Error('转出账户余额不足');
    }

    // 创建转账记录
    const transfer: AccountTransfer = {
      id: this.generateId(),
      fromAccountId,
      toAccountId,
      amount,
      fee,
      date: new Date().toISOString().split('T')[0],
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.accountTransfers.add(transfer);

    // 更新账户余额
    await db.accounts.update(fromAccountId, {
      balance: fromAccount.balance - totalAmount,
      updatedAt: new Date().toISOString()
    });

    await db.accounts.update(toAccountId, {
      balance: toAccount.balance + amount,
      updatedAt: new Date().toISOString()
    });

    return transfer;
  }

  // 获取转账历史
  async getTransferHistory(limit?: number): Promise<AccountTransfer[]> {
    let query = db.accountTransfers.orderBy('date').reverse();

    if (limit) {
      query = query.limit(limit);
    }

    return await query.toArray();
  }

  // 获取账户汇总信息
  async getAccountsSummary(): Promise<{
    totalBalance: number;
    totalAssets: number;
    totalLiabilities: number;
    accountCount: number;
  }> {
    const accounts = await this.getAllAccounts();

    let totalBalance = 0;
    let totalAssets = 0;
    let totalLiabilities = 0;

    accounts.forEach(account => {
      totalBalance += account.balance;

      // 信用卡类型余额为负债（负数）
      if (account.type === 'credit_card') {
        totalLiabilities += Math.abs(account.balance);
      } else {
        totalAssets += account.balance;
      }
    });

    return {
      totalBalance,
      totalAssets,
      totalLiabilities,
      accountCount: accounts.length
    };
  }
}

export const accountService = new AccountService();
