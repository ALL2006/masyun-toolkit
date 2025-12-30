import { create } from 'zustand';
import { Task, CreateTaskInput, TaskUpdateParams, ViewType, UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';
import { Preferences } from '@capacitor/preferences';

interface TaskStore {
  // 状态
  tasks: Task[];
  settings: UserSettings;
  currentView: ViewType;
  selectedDate: Date;
  isInitialized: boolean;

  // 任务操作
  addTask: (task: CreateTaskInput) => Promise<void>;
  updateTask: (id: string, updates: TaskUpdateParams) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => Task | undefined;
  getTasksByDateRange: (start: Date, end: Date) => Task[];

  // 视图操作
  setCurrentView: (view: ViewType) => Promise<void>;
  setSelectedDate: (date: Date) => void;

  // 设置操作
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;

  // 数据操作
  loadTasks: (tasks: Task[]) => Promise<void>;
  clearAllTasks: () => Promise<void>;
  exportTasks: () => string;
  importTasks: (jsonData: string) => Promise<void>;

  // 初始化
  initialize: () => Promise<void>;
}

// 存储键常量
const STORAGE_KEYS = {
  TASKS: 'timelineflow_tasks',
  SETTINGS: 'timelineflow_settings',
  VIEW: 'timelineflow_view',
  DATE: 'timelineflow_date'
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 保存数据到 Preferences
const saveTasks = async (tasks: Task[]) => {
  const data = JSON.stringify(tasks);
  await Preferences.set({
    key: STORAGE_KEYS.TASKS,
    value: data
  });
};

const saveSettings = async (settings: UserSettings) => {
  const data = JSON.stringify(settings);
  await Preferences.set({
    key: STORAGE_KEYS.SETTINGS,
    value: data
  });
};

const saveView = async (view: ViewType) => {
  await Preferences.set({
    key: STORAGE_KEYS.VIEW,
    value: view
  });
};

// 从 Preferences 加载数据
const loadTasksFromStorage = async (): Promise<Task[]> => {
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.TASKS });
    if (value) {
      const tasks = JSON.parse(value);
      // 将日期字符串转换回 Date 对象
      return tasks.map((task: any) => ({
        ...task,
        startTime: new Date(task.startTime),
        endTime: new Date(task.endTime),
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date()
      }));
    }
  } catch (error) {
    console.error('加载任务失败:', error);
  }
  return [];
};

const loadSettingsFromStorage = async (): Promise<UserSettings> => {
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.SETTINGS });
    if (value) {
      return JSON.parse(value);
    }
  } catch (error) {
    console.error('加载设置失败:', error);
  }
  return DEFAULT_SETTINGS;
};

const loadViewFromStorage = async (): Promise<ViewType> => {
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEYS.VIEW });
    return (value as ViewType) || DEFAULT_SETTINGS.defaultView;
  } catch (error) {
    console.error('加载视图失败:', error);
    return DEFAULT_SETTINGS.defaultView;
  }
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  // 初始状态
  tasks: [],
  settings: DEFAULT_SETTINGS,
  currentView: DEFAULT_SETTINGS.defaultView,
  selectedDate: new Date(),
  isInitialized: false,

  // 初始化 - 从存储加载数据
  initialize: async () => {
    const tasks = await loadTasksFromStorage();
    const settings = await loadSettingsFromStorage();
    const view = await loadViewFromStorage();

    set({
      tasks,
      settings: { ...DEFAULT_SETTINGS, ...settings },
      currentView: view,
      selectedDate: new Date(),
      isInitialized: true
    });
  },

  // 添加任务
  addTask: async (input) => {
    const newTask: Task = {
      id: generateId(),
      ...input,
      status: 'todo',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    set((state) => {
      const updatedTasks = [...state.tasks, newTask];
      // 异步保存，不阻塞 UI
      saveTasks(updatedTasks).catch(console.error);
      return { tasks: updatedTasks };
    });
  },

  // 更新任务
  updateTask: async (id, updates) => {
    set((state) => {
      const updatedTasks = state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      );
      // 异步保存
      saveTasks(updatedTasks).catch(console.error);
      return { tasks: updatedTasks };
    });
  },

  // 删除任务
  deleteTask: async (id) => {
    set((state) => {
      const updatedTasks = state.tasks.filter((task) => task.id !== id);
      // 异步保存
      saveTasks(updatedTasks).catch(console.error);
      return { tasks: updatedTasks };
    });
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
  setCurrentView: async (view) => {
    set({ currentView: view });
    // 异步保存
    saveView(view).catch(console.error);
  },

  // 设置选中日期（不需要持久化）
  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },

  // 更新设置
  updateSettings: async (newSettings) => {
    set((state) => {
      const updatedSettings = { ...state.settings, ...newSettings };
      // 异步保存
      saveSettings(updatedSettings).catch(console.error);
      return { settings: updatedSettings };
    });
  },

  // 加载任务（用于导入）
  loadTasks: async (tasks) => {
    set({ tasks });
    await saveTasks(tasks);
  },

  // 清空所有任务
  clearAllTasks: async () => {
    set({ tasks: [] });
    await saveTasks([]);
  },

  // 导出任务
  exportTasks: () => {
    const { tasks, settings } = get();
    return JSON.stringify({ tasks, settings }, null, 2);
  },

  // 导入任务
  importTasks: async (jsonData) => {
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
        await saveTasks(tasks);
      }
      if (data.settings) {
        set((state) => {
          const updatedSettings = { ...state.settings, ...data.settings };
          saveSettings(updatedSettings).catch(console.error);
          return { settings: updatedSettings };
        });
      }
    } catch (error) {
      console.error('导入失败:', error);
      throw new Error('数据格式不正确');
    }
  }
}));
