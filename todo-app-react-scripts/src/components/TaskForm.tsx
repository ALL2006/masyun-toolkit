import React, { useState } from 'react';
import { TaskPriority, TaskStatus, CreateTaskInput } from '../types';
import dayjs from 'dayjs';

interface TaskFormProps {
  onSubmit: (data: CreateTaskInput) => void;
  onCancel: () => void;
  initialValues?: Partial<CreateTaskInput>;
  submitLabel?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  initialValues,
  submitLabel = '创建'
}) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(
    initialValues?.priority || 'medium'
  );
  const [status, setStatus] = useState<TaskStatus>(
    initialValues?.status || 'todo'
  );

  // 多日任务支持：开始日期和结束日期
  const [startDate, setStartDate] = useState(
    initialValues?.startTime
      ? dayjs(initialValues.startTime).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD')
  );
  const [endDate, setEndDate] = useState(
    initialValues?.endTime
      ? dayjs(initialValues.endTime).format('YYYY-MM-DD')
      : dayjs().format('YYYY-MM-DD')
  );
  const [startTime, setStartTime] = useState(
    initialValues?.startTime
      ? dayjs(initialValues.startTime).format('HH:mm')
      : '09:00'
  );
  const [endTime, setEndTime] = useState(
    initialValues?.endTime
      ? dayjs(initialValues.endTime).format('HH:mm')
      : '10:00'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('请输入任务标题');
      return;
    }

    const startDateTime = dayjs(`${startDate} ${startTime}`).toDate();
    const endDateTime = dayjs(`${endDate} ${endTime}`).toDate();

    if (endDateTime <= startDateTime) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    const data: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: startDateTime,
      endTime: endDateTime,
      priority,
      status
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <label htmlFor="title">任务标题 *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入任务标题..."
          autoFocus
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">任务描述</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="添加任务描述..."
          rows={3}
        />
      </div>

      {/* 时间选择：支持多日任务 */}
      <div className="form-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="form-group">
          <label htmlFor="startDate">开始日期</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="startTime">开始时间</label>
          <input
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endDate">结束日期</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
          />
        </div>

        <div className="form-group">
          <label htmlFor="endTime">结束时间</label>
          <input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      {/* 多日任务提示 */}
      {dayjs(endDate).diff(dayjs(startDate), 'day') > 0 && (
        <div style={{ fontSize: '12px', color: '#8C8C8C', marginTop: '-8px', marginBottom: '12px' }}>
          📅 多日任务（共 {dayjs(endDate).diff(dayjs(startDate), 'day') + 1} 天）
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">优先级</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="urgent">🔴 紧急重要</option>
            <option value="high">🟠 重要</option>
            <option value="medium">🔵 一般</option>
            <option value="low">⚪ 低优先级</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="status">状态</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            <option value="todo">📋 待办</option>
            <option value="in-progress">🔄 进行中</option>
            <option value="done">✅ 已完成</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel">
          取消
        </button>
        <button type="submit" className="btn-submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
};
