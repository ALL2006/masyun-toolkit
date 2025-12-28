/**
 * AI 财务分析配置
 * 使用 DeepSeek API
 */

// API Key 拆分 + Base64 编码（用于基本保护）
// 原始 Key: sk-0e206db74958497c992a43103676d6ca
const API_KEY_PART1 = "c2stMGUyMDZkYjc0OTU4NDk3Yw==";  // sk-0e206db74958497c
const API_KEY_PART2 = "OTkyYTQzMTAzNjc2ZDZjYQ==";      // 992a43103676d6ca

/**
 * 获取完整的 API Key
 * 运行时拼接并解码两部分
 */
export function getApiKey(): string {
  try {
    const part1 = atob(API_KEY_PART1);
    const part2 = atob(API_KEY_PART2);
    return part1 + part2;
  } catch (error) {
    console.error('API Key 解码失败:', error);
    throw new Error('AI 配置错误');
  }
}

/**
 * AI API 配置
 */
export const AI_CONFIG = {
  // DeepSeek API 端点
  baseURL: 'https://api.deepseek.com/v1',

  // 使用的模型
  model: 'deepseek-chat',

  // API 超时时间（毫秒）
  timeout: 30000,

  // 最大 tokens
  maxTokens: 2000,

  // 温度参数（0-1，越高越随机）
  temperature: 0.7,
};

/**
 * 分析范围类型
 */
export type AnalysisRange = 'month' | 'quarter' | 'halfYear' | 'all';

/**
 * 分析范围配置
 */
export const RANGE_CONFIG: Record<AnalysisRange, { label: string; description: string }> = {
  month: {
    label: '本月',
    description: '分析当前月份的消费',
  },
  quarter: {
    label: '本季度',
    description: '分析最近3个月的消费',
  },
  halfYear: {
    label: '近半年',
    description: '分析最近6个月的消费',
  },
  all: {
    label: '全部数据',
    description: '分析所有历史数据',
  },
};
