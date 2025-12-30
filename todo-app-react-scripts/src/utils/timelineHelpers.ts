import dayjs from 'dayjs';
import { Task, TimelineGroup } from '../types';

/**
 * 生成日期分组列表
 * @param startDate 开始日期
 * @param endDate 结束日期
 * @returns 日期分组数组
 */
export function generateDateGroups(startDate: Date, endDate: Date): TimelineGroup[] {
  const groups: TimelineGroup[] = [];
  const current = dayjs(startDate).startOf('day');
  const end = dayjs(endDate).startOf('day');

  // 添加安全限制，最多生成 60 天的分组
  const maxDays = 60;
  let days = 0;

  while (current.isSame(end, 'day') || current.isBefore(end)) {
    if (days >= maxDays) {
      console.warn('generateDateGroups: 超过最大天数限制');
      break;
    }

    const dateStr = current.format('YYYY-MM-DD');
    groups.push({
      id: dateStr,
      title: current.format('MM月DD日'),
      rightTitle: current.format('dddd')
    });

    current.add(1, 'day');
    days++;
  }

  return groups;
}

/**
 * 获取任务所属的日期分组 ID
 * @param task 任务对象
 * @returns 日期字符串（YYYY-MM-DD 格式）
 */
export function getTaskDateGroup(task: Task): string {
  return dayjs(task.startTime).format('YYYY-MM-DD');
}

/**
 * 判断任务是否跨越多天
 * @param task 任务对象
 * @returns 是否跨越多天
 */
export function isMultiDayTask(task: Task): boolean {
  const startDay = dayjs(task.startTime).startOf('day');
  const endDay = dayjs(task.endTime).startOf('day');
  return endDay.diff(startDay, 'day') > 0;
}

/**
 * 计算任务跨越的天数
 * @param task 任务对象
 * @returns 天数（至少为 1）
 */
export function getTaskDaysSpan(task: Task): number {
  const startDay = dayjs(task.startTime).startOf('day');
  const endDay = dayjs(task.endTime).startOf('day');
  return Math.max(1, endDay.diff(startDay, 'day') + 1);
}
