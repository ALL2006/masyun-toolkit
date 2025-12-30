import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayjs from 'dayjs';
import { Task, ViewType } from '../types';
import { useTaskStore } from '../store/taskStore';
import { PRIORITY_COLORS } from '../constants';

interface CalendarViewProps {
  view: ViewType;
  selectedDate: Date;
  onTaskClick: (task: Task) => void;
  onTimeChange: (taskId: string, newStartTime: Date, newEndTime: Date) => void;
  onCanvasClick?: (clickTime: Date, groupId?: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  view,
  selectedDate,
  onTaskClick,
  onTimeChange,
  onCanvasClick
}) => {
  const { tasks } = useTaskStore();
  const calendarRef = useRef<FullCalendar>(null);

  // 转换任务数据为 FullCalendar 格式
  const calendarEvents = useMemo(() => {
    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      start: task.startTime.toISOString(),
      end: task.endTime.toISOString(),
      backgroundColor: PRIORITY_COLORS[task.priority],
      borderColor: PRIORITY_COLORS[task.priority],
      extendedProps: {
        task: task
      }
    }));
  }, [tasks]);

  // 根据 view 类型确定 FullCalendar 的 initialView
  const initialView = view === 'week' ? 'timeGridWeek' : 'dayGridMonth';

  // 计算时间范围
  const { validRangeStart, validRangeEnd } = useMemo(() => {
    const base = dayjs(selectedDate).startOf('day');

    if (view === 'week') {
      const weekStart = base.startOf('week');
      return {
        validRangeStart: weekStart.toDate(),
        validRangeEnd: weekStart.add(7, 'day').toDate()
      };
    } else {
      const monthStart = base.startOf('month');
      return {
        validRangeStart: monthStart.toDate(),
        validRangeEnd: monthStart.add(1, 'month').toDate()
      };
    }
  }, [view, selectedDate]);

  // 处理日期点击（空白处创建任务）
  const handleDateClick = useCallback((info: any) => {
    if (onCanvasClick) {
      const clickDate = new Date(info.dateStr);
      onCanvasClick(clickDate);
    }
  }, [onCanvasClick]);

  // 处理任务点击
  const handleEventClick = useCallback((info: any) => {
    const task = info.event.extendedProps.task as Task;
    if (task) {
      onTaskClick(task);
    }
  }, [onTaskClick]);

  // 处理任务拖拽
  const handleEventDrop = useCallback((info: any) => {
    const task = info.event.extendedProps.task as Task;
    if (task) {
      const newStartTime = new Date(info.event.start);
      const newEndTime = info.event.end ? new Date(info.event.end) : task.endTime;
      onTimeChange(task.id, newStartTime, newEndTime);
    }
  }, [onTimeChange]);

  // 处理任务时长调整
  const handleEventResize = useCallback((info: any) => {
    const task = info.event.extendedProps.task as Task;
    if (task) {
      const newStartTime = new Date(info.event.start);
      const newEndTime = new Date(info.event.end);
      onTimeChange(task.id, newStartTime, newEndTime);
    }
  }, [onTimeChange]);

  // 监听 view 变化，同步更新 FullCalendar 视图
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const newView = view === 'week' ? 'timeGridWeek' : 'dayGridMonth';
      calendarApi.changeView(newView);
    }
  }, [view]);

  // 监听 selectedDate 变化，同步更新 FullCalendar 日期
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.gotoDate(selectedDate);
    }
  }, [selectedDate]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px' }}>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView={initialView}
        initialDate={selectedDate}
        validRange={{
          start: validRangeStart,
          end: validRangeEnd
        }}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'timeGridWeek,dayGridMonth'
        }}
        buttonText={{
          today: '今天',
          week: '周视图',
          month: '月视图'
        }}
        slotDuration="00:30:00"
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        contentHeight="auto"
        allDaySlot={false}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={calendarEvents}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        locale="zh-cn"
      />
    </div>
  );
};
