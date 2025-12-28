/**
 * AI 财务分析服务
 * 负责数据预处理和 AI API 调用
 */

import { Transaction } from '../types';
import { getApiKey, AI_CONFIG, AnalysisRange } from '../config/aiConfig';

/**
 * 分析数据摘要 - 用于发送给 AI
 */
export interface AnalysisData {
  period: string;
  totalExpense: number;
  totalIncome: number;
  balance: number;           // 新增：结余
  savingsRate: number;       // 新增：储蓄率
  transactionCount: number;
  categoryBreakdown: Record<string, { amount: number; percent: number; count: number }>;
  largeTransactions: Array<{ date: string; amount: number; category: string; note: string }>;
  sampleTransactions: Array<{ date: string; amount: number; category: string; note: string }>;
  averagePerTransaction: number;
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

/**
 * 根据选择的范围获取日期范围
 */
function getDateRange(range: AnalysisRange): { startDate: string; endDate: string; periodLabel: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  let startDate: string;
  let periodLabel: string;

  switch (range) {
    case 'month':
      // 本月第一天
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      periodLabel = `${now.getFullYear()}年${now.getMonth() + 1}月`;
      break;
    case 'quarter':
      // 本季度第一天（最近3个月）
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStartMonth, 1).toISOString().split('T')[0];
      periodLabel = `${now.getFullYear()}年第${Math.floor(now.getMonth() / 3) + 1}季度`;
      break;
    case 'halfYear':
      // 近6个月
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split('T')[0];
      periodLabel = '近半年';
      break;
    case 'all':
      // 全部数据（使用很早的日期）
      startDate = '2000-01-01';
      periodLabel = '全部历史数据';
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      periodLabel = '本月';
  }

  return { startDate, endDate, periodLabel };
}

/**
 * 预处理交易数据，生成分析摘要
 */
export async function prepareAnalysisData(
  transactions: Transaction[],
  range: AnalysisRange
): Promise<AnalysisData> {
  // 获取日期范围
  const { startDate, endDate, periodLabel } = getDateRange(range);

  // 过滤指定范围内的支出记录
  const filteredTransactions = transactions.filter(t => {
    return t.date >= startDate && t.date <= endDate && t.type === 'expense';
  });

  // 计算总支出和总收入
  const totalExpense = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  const incomeTransactions = transactions.filter(t => {
    return t.date >= startDate && t.date <= endDate && t.type === 'income';
  });
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  // 新增：计算结余和储蓄率
  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  // 按类别分组统计
  const categoryMap = new Map<string, { amount: number; count: number }>();
  filteredTransactions.forEach(t => {
    const current = categoryMap.get(t.category) || { amount: 0, count: 0 };
    categoryMap.set(t.category, {
      amount: current.amount + t.amount,
      count: current.count + 1
    });
  });

  // 计算占比并转换为数组格式
  const categoryBreakdown: Record<string, { amount: number; percent: number; count: number }> = {};
  categoryMap.forEach((value, category) => {
    categoryBreakdown[category] = {
      amount: value.amount,
      percent: totalExpense > 0 ? (value.amount / totalExpense) * 100 : 0,
      count: value.count
    };
  });

  // 识别大额交易（单笔 > 500 元）
  const largeTransactions = filteredTransactions
    .filter(t => t.amount > 500)
    .map(t => ({
      date: t.date,
      amount: t.amount,
      category: t.category,
      note: t.description || '无备注'
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10); // 最多显示10笔

  // 获取每个类别的代表性交易（含备注），让 AI 分析更细致
  const categorySamples = new Map<string, Array<{ date: string; amount: number; category: string; note: string }>>();
  filteredTransactions.forEach(t => {
    const current = categorySamples.get(t.category) || [];
    // 每个类别最多取 3 笔代表性交易（优先取金额大的，且有备注的）
    if (current.length < 3) {
      categorySamples.set(t.category, [
        ...current,
        {
          date: t.date,
          amount: t.amount,
          category: t.category,
          note: t.description || '无备注'
        }
      ].sort((a, b) => b.amount - a.amount));
    }
  });

  // 按类别金额排序，选取前 5 个主要类别的交易样本
  const sampleTransactions: Array<{ date: string; amount: number; category: string; note: string }> = [];
  const sortedCategories = Object.entries(categoryBreakdown)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .slice(0, 5)
    .map(([cat]) => cat);

  sortedCategories.forEach(cat => {
    const samples = categorySamples.get(cat) || [];
    sampleTransactions.push(...samples);
  });

  // 计算平均每笔支出
  const averagePerTransaction = filteredTransactions.length > 0
    ? totalExpense / filteredTransactions.length
    : 0;

  return {
    period: periodLabel,
    totalExpense: Math.round(totalExpense * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    balance: Math.round(balance * 100) / 100,       // 新增：结余
    savingsRate: Math.round(savingsRate * 10) / 10, // 新增：储蓄率（保留1位小数）
    transactionCount: filteredTransactions.length,
    categoryBreakdown,
    largeTransactions,
    sampleTransactions,
    averagePerTransaction: Math.round(averagePerTransaction * 100) / 100
  };
}

/**
 * 生成 AI Prompt
 */
function generateAnalysisPrompt(data: AnalysisData): string {
  // 按金额排序类别
  const sortedCategories = Object.entries(data.categoryBreakdown)
    .sort(([, a], [, b]) => b.amount - a.amount);

  const categoryText = sortedCategories
    .map(([cat, info]) => `- ${cat}：${info.amount.toFixed(2)} 元（${info.percent.toFixed(1)}%），${info.count} 笔`)
    .join('\n');

  const largeTransactionsText = data.largeTransactions.length > 0
    ? data.largeTransactions.map(t =>
        `- ${t.date} ${t.category} ${t.amount.toFixed(2)} 元（${t.note}）`
      ).join('\n')
    : '无';

  // 代表性交易明细（含备注）
  const sampleTransactionsText = data.sampleTransactions.length > 0
    ? data.sampleTransactions
        .filter(t => t.note !== '无备注')
        .map(t => `- ${t.date} ${t.category} ${t.amount.toFixed(2)} 元 → "${t.note}"`)
        .join('\n')
    : '无';

  // 财务健康度评估
  const balanceStatus = data.balance >= 0
    ? `+${data.balance.toFixed(2)} 元（结余为正，财务状况${data.savingsRate > 20 ? '优秀' : data.savingsRate > 10 ? '良好' : '一般'}）`
    : `${data.balance.toFixed(2)} 元（⚠️ 入不敷出，需要警惕！）`;

  const savingsRateText = data.totalIncome > 0
    ? `${data.savingsRate.toFixed(1)}%（${data.savingsRate >= 20 ? '✅ 储蓄习惯很好' : data.savingsRate >= 10 ? '💪 继续保持，争取提高到20%' : '💡 建议提高到20%以上'}）`
    : '0%（无收入记录）';

  return `你是一个专业且友好的财务顾问，正在帮助一位大学生/年轻人分析消费情况。请用鼓励、理解的语气，像朋友一样给出建议。

=== 📊 财务概况 ===
分析期间：${data.period}
总收入：${data.totalIncome.toFixed(2)} 元
总支出：${data.totalExpense.toFixed(2)} 元
收支结余：${balanceStatus}
储蓄率：${savingsRateText}
交易笔数：${data.transactionCount} 笔

=== 📈 支出分类统计 ===
${categoryText}

=== 🛒 具体消费明细 ===（用于了解消费内容和习惯）
${sampleTransactionsText}

=== 💰 大额支出提醒 ===（单笔超过500元）
${largeTransactionsText}

=== 📋 分析要求 ===

请提供以下内容：

1.【消费亮点】（1-2条，表扬做得好的地方）
   - 哪些类别控制得比较好？
   - 有什么值得保持的好习惯？

2.【需要关注】（1-2条，指出可以优化的地方）
   - 结合消费明细中的备注（如"上网吧"、"KTV"、"外卖"等），指出非必要支出
   - 区分必要支出（学习、正餐）和弹性支出（娱乐、零食）
   - 如果某个类别超过40%，要特别提醒

3.【行动建议】（3-5条，每条25-35字，具体可行）
   - 给出明确的、可执行的建议
   - 用激励性语言，比如"如果...，每月可以多存约xxx元"
   - 建议各类别的月度预算上限
   - 针对备注内容给出具体建议

4.【月度预算建议】（可选）
   - 如果储蓄率偏低，给出各类别的建议预算

🎯 语言风格：
- 语气友好，像朋友聊天
- 多鼓励，少说教
- 建议具体可行，不要空洞
- 结合消费备注内容，给出针对性建议
- 考虑到大学生/年轻人的实际情况

请按以下格式回复（严格按格式）：

【消费亮点】
你的亮点内容...

【需要关注】
1. 第一个问题
2. 第二个问题

【行动建议】
1. 第一条建议（25-35字）
2. 第二条建议（25-35字）
3. 第三条建议（25-35字）`;
}

/**
 * 解析 AI 返回的结果
 */
function parseAIResponse(response: string): AIAnalysisResult {
  try {
    // 尝试按新格式解析
    const summaryMatch = response.match(/【消费亮点】\s*([\s\S]*?)(?=【需要关注】|$)/);
    const insightsMatch = response.match(/【需要关注】\s*([\s\S]*?)(?=【行动建议】|$)/);
    const suggestionsMatch = response.match(/【行动建议】\s*([\s\S]*)/);

    const summary = summaryMatch?.[1]?.trim() || '解析失败，请重试';

    // 解析需要关注（按行分割，移除编号）
    let insights: string[] = [];
    if (insightsMatch?.[1]) {
      insights = insightsMatch[1]
        .split('\n')
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .filter(line => line.length > 0);
    }

    // 解析行动建议（按行分割，移除编号）
    let suggestions: string[] = [];
    if (suggestionsMatch?.[1]) {
      suggestions = suggestionsMatch[1]
        .split('\n')
        .map(line => line.replace(/^\d+\.?\s*/, '').trim())
        .filter(line => line.length > 0);
    }

    return { summary, insights, suggestions };
  } catch (error) {
    // 如果解析失败，返回原始文本
    return {
      summary: response,
      insights: [],
      suggestions: []
    };
  }
}

/**
 * 调用 AI 进行财务分析
 */
export async function analyzeWithAI(data: AnalysisData): Promise<AIAnalysisResult> {
  const apiKey = getApiKey();
  const prompt = generateAnalysisPrompt(data);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);

    const response = await fetch(`${AI_CONFIG.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的财务顾问，擅长分析消费数据并给出实用的节省建议。你的语气友好，像朋友一样聊天。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
    }

    const result = await response.json();

    if (!result.choices || result.choices.length === 0) {
      throw new Error('AI 返回结果为空');
    }

    const content = result.choices[0].message.content;
    return parseAIResponse(content);

  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }
    throw error;
  }
}

/**
 * 完整的分析流程：预处理数据 + AI 分析
 */
export async function performFullAnalysis(
  transactions: Transaction[],
  range: AnalysisRange
): Promise<{ data: AnalysisData; result: AIAnalysisResult }> {
  // 1. 预处理数据
  const analysisData = await prepareAnalysisData(transactions, range);

  // 2. 如果没有数据，直接返回
  if (analysisData.transactionCount === 0) {
    return {
      data: analysisData,
      result: {
        summary: '暂无消费数据',
        insights: ['请先添加一些消费记录'],
        suggestions: ['点击"记账"按钮添加第一笔消费']
      }
    };
  }

  // 3. 调用 AI 分析
  const aiResult = await analyzeWithAI(analysisData);

  return { data: analysisData, result: aiResult };
}
