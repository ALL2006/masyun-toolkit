import React, { useMemo } from 'react';
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader
} from 'react-calendar-timeline';
import dayjs from 'dayjs';
import { Task, ViewType } from '../types';
import { PRIORITY_COLORS } from '../constants';
import { useTaskStore } from '../store/taskStore';

interface TimelineViewProps {
  view: ViewType;
  selectedDate: Date;
  onTaskClick: (task: Task) => void;
  onTimeChange: (taskId: string, newStartTime: Date, newEndTime: Date) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  view,
  selectedDate,
  onTaskClick,
  onTimeChange
}) => {
  const { tasks, getTasksByDateRange } = useTaskStore();

  // 计算时间范围
  const { defaultTimeStart, defaultTimeEnd } = useMemo(() => {
    const base = dayjs(selectedDate).startOf('day');

    if (view === 'week') {
      const weekStart = base.startOf('week');
      return {
        defaultTimeStart: weekStart.toDate(),
        defaultTimeEnd: weekStart.add(7, 'day').toDate()
      };
    } else {
      const monthStart = base.startOf('month');
      return {
        defaultTimeStart: monthStart.toDate(),
        defaultTimeEnd: monthStart.add(1, 'month').toDate()
      };
    }
  }, [view, selectedDate]);

  // 转换任务为时间线格式
  const { timelineGroups, timelineTasks } = useMemo(() => {
    const startDate = new Date(defaultTimeStart);
    const endDate = new Date(defaultTimeEnd);
    const visibleTasks = getTasksByDateRange(startDate, endDate);

    const groups = visibleTasks.map((task) => ({
      id: task.id,
      title: task.title
    }));

    const timelineTasks = visibleTasks.map((task) => ({
      id: task.id,
      group: task.id,
      title: task.title,
      start_time: task.startTime.valueOf(),
      end_time: task.endTime.valueOf(),
      itemProps: {
        className: `task-item task-${task.priority}`,
        style: {
          backgroundColor: PRIORITY_COLORS[task.priority],
          borderColor: PRIORITY_COLORS[task.priority]
        }
      }
    }));

    return { timelineGroups: groups, timelineTasks };
  }, [tasks, defaultTimeStart, defaultTimeEnd, getTasksByDateRange]);

  // 处理任务移动
  const handleItemMove = (itemId: string, dragTime: number) => {
    const task = tasks.find((t) => t.id === itemId);
    if (!task) return;

    const duration = task.endTime.getTime() - task.startTime.getTime();
    const newStartTime = new Date(dragTime);
    const newEndTime = new Date(dragTime + duration);

    onTimeChange(itemId, newStartTime, newEndTime);
  };

  // 处理任务点击
  const handleItemClick = (itemId: string) => {
    const task = tasks.find((t) => t.id === itemId);
    if (task) onTaskClick(task);
  };

  return (
    <div className="timeline-container">
      <Timeline
        groups={timelineGroups}
        items={timelineTasks}
        defaultTimeStart={defaultTimeStart}
        defaultTimeEnd={defaultTimeEnd}
        itemHeightRatio={0.75}
        lineHeight={60}
        canMove={true}
        canResize={false}
        canSelect={true}
        itemTouchSendsClick={false}
        stackItems
        onItemMove={handleItemMove}
        onItemClick={handleItemClick}
        itemRenderer={({
          item,
          itemContext
        }: any) => {
          const task = tasks.find((t) => t.id === item.id);
          const color = task ? PRIORITY_COLORS[task.priority] : '#1890FF';

          return (
            <div
              style={{
                position: 'absolute',
                left: `${itemContext.dimensions.left}px`,
                top: `${itemContext.dimensions.top}px`,
                width: `${itemContext.dimensions.width}px`,
                height: `${itemContext.dimensions.height}px`,
                backgroundColor: color,
                borderLeft: `4px solid ${color}`,
                borderRadius: '4px',
                color: 'white',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: '500',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                e.currentTarget.style.zIndex = '10';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
                e.currentTarget.style.zIndex = '1';
              }}
            >
              <div className="task-item-title" style={{ fontWeight: 600, marginBottom: '2px' }}>
                {itemContext.title}
              </div>
              <div className="task-item-time" style={{ fontSize: '12px', opacity: 0.9 }}>
                {dayjs(item.start_time).format('HH:mm')} -{' '}
                {dayjs(item.end_time).format('HH:mm')}
              </div>
            </div>
          );
        }}
      >
        <TimelineHeaders className="sticky">
          <SidebarHeader>
            {({ getRootProps }: any) => {
              return <div {...getRootProps()} />;
            }}
          </SidebarHeader>
          <DateHeader unit="primaryHeader" />
          <DateHeader />
        </TimelineHeaders>
      </Timeline>
    </div>
  );
};
