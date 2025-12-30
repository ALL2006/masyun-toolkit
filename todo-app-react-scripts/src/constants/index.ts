import { TaskPriority, TaskStatus } from '../types';

// 优先级颜色方案
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  urgent: '#FF4D4F',    // 红 - 紧急且重要
  high: '#FA8C16',      // 橙 - 重要不紧急
  medium: '#1890FF',    // 蓝 - 紧急不重要
  low: '#8C8C8C'        // 灰 - 不紧急不重要
};

// 优先级标签
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  urgent: '紧急重要',
  high: '重要',
  medium: '一般',
  low: '低优先级'
};

// 状态颜色
export const STATUS_COLORS: Record<TaskStatus, string> = {
  'todo': '#1890FF',
  'in-progress': '#FAAD14',
  'done': '#52C41A'
};

// 状态标签
export const STATUS_LABELS: Record<TaskStatus, string> = {
  'todo': '待办',
  'in-progress': '进行中',
  'done': '已完成'
};

// 状态图标
export const STATUS_ICONS: Record<TaskStatus, string> = {
  'todo': '📋',
  'in-progress': '🔄',
  'done': '✅'
};

// 默认设置
export const DEFAULT_SETTINGS = {
  defaultView: 'week' as const,
  weekStartsOn: 'monday' as const,
  startHour: 6,
  endHour: 22
};

// 时间线配置
export const TIMELINE_CONFIG = {
  // 毫秒单位转换
  MINUTES: 60 * 1000,
  HOURS: 60 * 60 * 1000,
  DAYS: 24 * 60 * 60 * 1000,
  WEEKS: 7 * 24 * 60 * 60 * 1000,

  // 默认时间段（用于新任务）
  DEFAULT_TASK_DURATION: 60 * 60 * 1000, // 1小时

  // 视图配置
  WEEK_VIEW_DAYS: 7,
  MONTH_VIEW_DAYS: 30
};
