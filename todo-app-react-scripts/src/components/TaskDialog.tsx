import React from 'react';
import { CreateTaskInput } from '../types';
import { TaskForm } from './TaskForm';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput) => void;
  initialValues?: Partial<CreateTaskInput>;
  title?: string;
  submitLabel?: string;
}

export const TaskDialog: React.FC<TaskDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  title = '创建任务',
  submitLabel
}) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{title}</h2>
          <button className="dialog-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="dialog-body">
          <TaskForm
            onSubmit={onSubmit}
            onCancel={onClose}
            initialValues={initialValues}
            submitLabel={submitLabel}
          />
        </div>
      </div>
    </div>
  );
};
