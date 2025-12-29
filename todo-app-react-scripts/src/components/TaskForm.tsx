import React, { useState } from 'react';
import { TaskPriority, CreateTaskInput } from '../types';
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
  const [date, setDate] = useState(
    initialValues?.startTime
      ? dayjs(initialValues.startTime).format('YYYY-MM-DD')
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

    const startDateTime = dayjs(`${date} ${startTime}`).toDate();
    const endDateTime = dayjs(`${date} ${endTime}`).toDate();

    if (endDateTime <= startDateTime) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    const data: CreateTaskInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      startTime: startDateTime,
      endTime: endDateTime,
      priority
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

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">日期</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
          <label htmlFor="endTime">结束时间</label>
          <input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

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
