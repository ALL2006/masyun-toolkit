import { create } from 'zustand';
import { Task, CreateTaskInput, TaskUpdateParams, ViewType, UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

interface TaskStore {
  // 状态
  tasks: Task[];
  settings: UserSettings;
  currentView: ViewType;
  selectedDate: Date;

  // 任务操作
  addTask: (task: CreateTaskInput) => void;
  updateTask: (id: string, updates: TaskUpdateParams) => void;
  deleteTask: (id: string) => void;
  getTask: (id: string) => Task | undefined;
  getTasksByDateRange: (start: Date, end: Date) => Task[];

  // 视图操作
  setCurrentView: (view: ViewType) => void;
  setSelectedDate: (date: Date) => void;

  // 设置操作
  updateSettings: (settings: Partial<UserSettings>) => void;

  // 数据操作
  loadTasks: (tasks: Task[]) => void;
  clearAllTasks: () => void;
  exportTasks: () => string;
  importTasks: (jsonData: string) => void;
}

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  // 初始状态
  tasks: [],
  settings: DEFAULT_SETTINGS,
  currentView: DEFAULT_SETTINGS.defaultView,
  selectedDate: new Date(),

  // 添加任务
  addTask: (input) => {
    const newTask: Task = {
      id: generateId(),
      ...input,
      status: 'todo',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  // 更新任务
  updateTask: (id, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    }));
  },

  // 删除任务
  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id)
    }));
  },

  // 获取单个任务
  getTask: (id) => {
    return get().tasks.find((task) => task.id === id);
  },

  // 根据日期范围获取任务
  getTasksByDateRange: (start, end) => {
    const { tasks } = get();
    return tasks.filter((task) => {
      const taskStart = task.startTime.getTime();
      const taskEnd = task.endTime.getTime();
      const rangeStart = start.getTime();
      const rangeEnd = end.getTime();
      return taskStart < rangeEnd && taskEnd > rangeStart;
    });
  },

  // 设置当前视图
  setCurrentView: (view) => {
    set({ currentView: view });
  },

  // 设置选中日期
  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },

  // 更新设置
  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings }
    }));
  },

  // 加载任务
  loadTasks: (tasks) => {
    set({ tasks });
  },

  // 清空所有任务
  clearAllTasks: () => {
    set({ tasks: [] });
  },

  // 导出任务
  exportTasks: () => {
    const { tasks, settings } = get();
    return JSON.stringify({ tasks, settings }, null, 2);
  },

  // 导入任务
  importTasks: (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.tasks && Array.isArray(data.tasks)) {
        // 将日期字符串转换回 Date 对象
        const tasks = data.tasks.map((task: any) => ({
          ...task,
          startTime: new Date(task.startTime),
          endTime: new Date(task.endTime),
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date()
        }));
        set({ tasks });
      }
      if (data.settings) {
        set((state) => ({
          settings: { ...state.settings, ...data.settings }
        }));
      }
    } catch (error) {
      console.error('导入失败:', error);
      throw new Error('数据格式不正确');
    }
  }
}));
