import React, { useState, useEffect, useCallback } from 'react';
import { useTaskStore } from './store/taskStore';
import { CalendarView } from './components/CalendarView';
import { TaskDialog } from './components/TaskDialog';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Task, CreateTaskInput } from './types';
import dayjs from 'dayjs';
import './App.css';

function App() {
  const {
    tasks,
    currentView,
    selectedDate,
    isInitialized,
    initialize,
    setCurrentView,
    setSelectedDate,
    addTask,
    updateTask,
    deleteTask,
    exportTasks,
    importTasks
  } = useTaskStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [initialTimeValues, setInitialTimeValues] = useState<{ startTime: Date; endTime: Date } | null>(null);

  // 初始化：从 Capacitor Preferences 加载数据
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 打开创建任务对话框
  const handleCreateTask = useCallback(() => {
    setEditingTask(null);
    setDialogMode('create');
    setInitialTimeValues(null);
    setIsDialogOpen(true);
  }, []);

  // 打开编辑任务对话框
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setDialogMode('edit');
    setInitialTimeValues(null);
    setIsDialogOpen(true);
  }, []);

  // 提交任务（创建或更新）
  const handleSubmit = useCallback(async (data: CreateTaskInput) => {
    if (dialogMode === 'create') {
      await addTask(data);
    } else if (editingTask) {
      await updateTask(editingTask.id, data);
    }
    setIsDialogOpen(false);
    setEditingTask(null);
  }, [dialogMode, editingTask, addTask, updateTask]);

  // 删除任务
  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      await deleteTask(taskId);
      setIsDialogOpen(false);
    }
  }, [deleteTask]);

  // 处理任务时间拖拽
  const handleTimeChange = useCallback(async (taskId: string, newStartTime: Date, newEndTime: Date) => {
    await updateTask(taskId, {
      startTime: newStartTime,
      endTime: newEndTime
    });
  }, [updateTask]);

  // 处理状态切换（循环：todo -> in-progress -> done -> todo）
  const handleStatusToggle = useCallback(async (taskId: string) => {
    await updateTask(taskId, { status: 'in-progress' });
  }, [updateTask]);

  // 处理点击空白处创建任务
  const handleCanvasClick = useCallback((clickDate: Date, groupId?: string) => {
    // 预填充时间：点击时间对齐到整点，持续1小时
    const startTime = dayjs(clickDate).startOf('hour').toDate();
    const endTime = dayjs(startTime).add(1, 'hour').toDate();

    // 打开创建对话框
    setEditingTask(null);
    setDialogMode('create');

    // 暂存初始时间值（用于传递给 TaskDialog）
    setInitialTimeValues({ startTime, endTime });
    setIsDialogOpen(true);
  }, []);

  // 导航到今天
  const goToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  // 导航到上一天/周
  const navigateBack = useCallback(() => {
    if (currentView === 'week') {
      setSelectedDate(dayjs(selectedDate).subtract(1, 'week').toDate());
    } else {
      setSelectedDate(dayjs(selectedDate).subtract(1, 'month').toDate());
    }
  }, [currentView, selectedDate, setSelectedDate]);

  // 导航到下一天/周
  const navigateForward = useCallback(() => {
    if (currentView === 'week') {
      setSelectedDate(dayjs(selectedDate).add(1, 'week').toDate());
    } else {
      setSelectedDate(dayjs(selectedDate).add(1, 'month').toDate());
    }
  }, [currentView, selectedDate, setSelectedDate]);

  // 切换视图
  const toggleView = useCallback(async () => {
    await setCurrentView(currentView === 'week' ? 'month' : 'week');
  }, [currentView, setCurrentView]);

  // 导出数据
  const handleExport = useCallback(() => {
    const data = exportTasks();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timelineflow-backup-${dayjs().format('YYYY-MM-DD')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportTasks]);

  // 导入数据
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = event.target?.result as string;
            await importTasks(data);
            alert('导入成功！');
          } catch (error) {
            alert('导入失败，请检查文件格式');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, [importTasks]);

  // 等待初始化完成
  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        加载中...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
      {/* 顶部导航栏 */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">TimelineFlow</h1>
          <span className="app-subtitle">时光流</span>
        </div>

        <div className="header-center">
          <button className="nav-btn" onClick={navigateBack}>
            ‹
          </button>
          <button className="nav-btn" onClick={goToToday}>
            今天
          </button>
          <button className="nav-btn" onClick={navigateForward}>
            ›
          </button>
          <span className="current-date">
            {dayjs(selectedDate).format('YYYY年MM月')}
          </span>
        </div>

        <div className="header-right">
          <button className="view-btn" onClick={toggleView}>
            {currentView === 'week' ? '周视图' : '月视图'}
          </button>
          <button className="primary-btn" onClick={handleCreateTask}>
            + 新建任务
          </button>
        </div>
      </header>

      {/* 工具栏 */}
      <div className="toolbar">
        <div className="toolbar-left">
          <span className="task-count">
            共 {tasks.length} 个任务
          </span>
        </div>
        <div className="toolbar-right">
          <button className="toolbar-btn" onClick={handleExport}>
            导出
          </button>
          <button className="toolbar-btn" onClick={handleImport}>
            导入
          </button>
        </div>
      </div>

      {/* 图例 */}
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#FF4D4F' }}></div>
          <span>紧急重要</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#FA8C16' }}></div>
          <span>重要</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#1890FF' }}></div>
          <span>一般</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#8C8C8C' }}></div>
          <span>低优先级</span>
        </div>
      </div>

      {/* 日历视图 */}
      <div className="calendar-wrapper">
        <CalendarView
          view={currentView}
          selectedDate={selectedDate}
          onTaskClick={handleEditTask}
          onTimeChange={handleTimeChange}
          onCanvasClick={handleCanvasClick}
        />
      </div>

      {/* 任务对话框 */}
      <TaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSubmit}
        initialValues={
          editingTask
            ? {
                title: editingTask.title,
                description: editingTask.description,
                startTime: editingTask.startTime,
                endTime: editingTask.endTime,
                priority: editingTask.priority,
                status: editingTask.status,
                tags: editingTask.tags
              }
            : initialTimeValues
            ? {
                startTime: initialTimeValues.startTime,
                endTime: initialTimeValues.endTime
              }
            : undefined
        }
        title={dialogMode === 'create' ? '创建任务' : '编辑任务'}
        submitLabel={dialogMode === 'create' ? '创建' : '保存'}
      />

      {/* 编辑模式下的删除按钮 */}
      {dialogMode === 'edit' && editingTask && (
        <div className="dialog-footer">
          <button
            className="btn-delete"
            onClick={() => handleDeleteTask(editingTask.id)}
          >
            删除任务
          </button>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}

export default App;
