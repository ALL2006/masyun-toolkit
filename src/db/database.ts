import Dexie, { Table } from 'dexie';
import { Transaction, Category, Account, AccountTransfer, Budget } from '../types';

export class FinanceTrackerDB extends Dexie {
  transactions!: Table<Transaction>;
  categories!: Table<Category>;
  accounts!: Table<Account>;
  accountTransfers!: Table<AccountTransfer>;
  budgets!: Table<Budget>;

  constructor() {
    super('FinanceTracker');

    // 版本1: 初始版本
    this.version(1).stores({
      transactions: 'id, type, amount, category, date, createdAt',
      categories: 'id, name, type'
    });

    // 版本2: 添加账户管理
    this.version(2).stores({
      transactions: 'id, type, amount, category, date, createdAt, accountId',
      categories: 'id, name, type',
      accounts: 'id, type, name, sortOrder, isActive',
      accountTransfers: 'id, fromAccountId, toAccountId, date'
    }).upgrade(async tx => {
      // 迁移逻辑: 为现有交易添加默认账户
      const transactions = await tx.table('transactions').toArray();
      for (const transaction of transactions) {
        if (!(transaction as any).accountId) {
          await tx.table('transactions').update(transaction.id, {
            accountId: 'default',
            accountName: '默认账户'
          });
        }
      }
    });

    // 版本3: 添加预算管理
    this.version(3).stores({
      transactions: 'id, type, amount, category, date, createdAt, accountId',
      categories: 'id, name, type',
      accounts: 'id, type, name, sortOrder, isActive',
      accountTransfers: 'id, fromAccountId, toAccountId, date',
      budgets: 'id, categoryId, year, month, isActive'
    });
  }
}

export const db = new FinanceTrackerDB();

// 预设分类数据
export const defaultCategories: Category[] = [
  { id: '1', name: '餐饮', icon: '🍽️', color: '#FF6B6B', type: 'expense' },
  { id: '2', name: '学习', icon: '📚', color: '#4ECDC4', type: 'expense' },
  { id: '3', name: '交通', icon: '🚗', color: '#45B7D1', type: 'expense' },
  { id: '4', name: '娱乐', icon: '🎮', color: '#96CEB4', type: 'expense' },
  { id: '5', name: '购物', icon: '🛍️', color: '#FFEAA7', type: 'expense' },
  { id: '6', name: '兼职', icon: '💼', color: '#52C41A', type: 'income' },
  { id: '7', name: '生活费', icon: '💰', color: '#52C41A', type: 'income' },
  { id: '8', name: '其他', icon: '📦', color: '#95A5A6', type: 'expense' }
];

// 预设账户数据
export const defaultAccounts: Account[] = [
  {
    id: 'default',
    name: '默认账户',
    type: 'cash',
    icon: '💵',
    color: '#52C41A',
    balance: 0,
    initialBalance: 0,
    isActive: true,
    sortOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'alipay',
    name: '支付宝',
    type: 'alipay',
    icon: '💙',
    color: '#1890FF',
    balance: 0,
    initialBalance: 0,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'wechat',
    name: '微信支付',
    type: 'wechat',
    icon: '💚',
    color: '#52C41A',
    balance: 0,
    initialBalance: 0,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 初始化数据库
export async function initDB() {
  // 初始化分类
  const categoryCount = await db.categories.count();
  if (categoryCount === 0) {
    await db.categories.bulkAdd(defaultCategories);
  }

  // 初始化账户
  const accountCount = await db.accounts.count();
  if (accountCount === 0) {
    await db.accounts.bulkAdd(defaultAccounts);
  }
}