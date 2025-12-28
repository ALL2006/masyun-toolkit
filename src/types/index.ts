export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  accountId: string;        // 新增: 关联账户ID
  accountName?: string;     // 新增: 冗余字段，账户名称
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== 账户管理 ====================
export type AccountType = 'cash' | 'bank_card' | 'alipay' | 'wechat' | 'credit_card' | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  icon: string;
  color: string;
  balance: number;
  initialBalance: number;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccountTransfer {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  fee?: number;
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== 预算管理 ====================
export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  period: 'monthly';
  year: number;
  month: number;
  alertThreshold: number;  // 预警阈值 (80 = 80%)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetExecution {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
  dailyAverage: number;
  projectedSpending: number;
  daysRemaining: number;
}

// ==================== 报表导出 ====================
export interface ReportOptions {
  type: 'monthly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
}

export interface ReportData {
  meta: ReportMeta;
  summary: ReportSummary;
  categoryBreakdown: ReportCategoryItem[];
  dailyBreakdown: ReportDailyItem[];
  accountBreakdown: ReportAccountItem[];
}

export interface ReportMeta {
  title: string;
  type: string;
  period: string;
  generatedAt: string;
}

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  transactionCount: number;
  avgDailyExpense: number;
  maxExpenseDay: string;
  maxExpenseAmount: number;
}

export interface ReportCategoryItem {
  category: string;
  income: number;
  expense: number;
  transactionCount: number;
  percentage: number;
}

export interface ReportDailyItem {
  date: string;
  income: number;
  expense: number;
  net: number;
  transactionCount: number;
}

export interface ReportAccountItem {
  accountId: string;
  accountName: string;
  income: number;
  expense: number;
  currentBalance: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export interface Statistics {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryStats: CategoryStat[];
}

export interface CategoryStat {
  category: string;
  amount: number;
  percentage: number;
}

export type TimeRange = 'day' | 'week' | 'month';

// ==================== AI 财务分析 ====================

/**
 * AI 分析数据摘要 - 用于发送给 AI
 */
export interface AIAnalysisData {
  period: string;
  totalExpense: number;
  totalIncome: number;
  balance: number;       // 结余
  savingsRate: number;   // 储蓄率
  transactionCount: number;
  categoryBreakdown: Record<string, CategoryBreakdownItem>;
  largeTransactions: LargeTransaction[];
  averagePerTransaction: number;
}

/**
 * 分类统计项
 */
export interface CategoryBreakdownItem {
  amount: number;
  percent: number;
  count: number;
}

/**
 * 大额交易
 */
export interface LargeTransaction {
  date: string;
  amount: number;
  category: string;
  note: string;
}

/**
 * AI 分析结果
 */
export interface AIAnalysisResult {
  summary: string;       // 消费亮点
  insights: string[];    // 需要关注
  suggestions: string[]; // 行动建议
  predictedSavings?: string; // 预测节省
}