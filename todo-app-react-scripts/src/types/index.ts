// 任务优先级
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

// 任务状态
export type TaskStatus = 'todo' | 'in-progress' | 'done';

// 任务数据模型
export interface Task {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  priority: TaskPriority;
  status: TaskStatus;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 创建任务输入
export interface CreateTaskInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  priority: TaskPriority;
  tags?: string[];
}

// 更新任务输入 - 修改为函数参数类型
export type TaskUpdateParams = Partial<Omit<CreateTaskInput, 'startTime' | 'endTime'>> & {
  startTime?: Date;
  endTime?: Date;
};

// 视图类型
export type ViewType = 'week' | 'month';

// 用户设置
export interface UserSettings {
  defaultView: ViewType;
  weekStartsOn: 'monday' | 'sunday';
  startHour: number;
  endHour: number;
}

// 应用状态
export interface AppState {
  tasks: Task[];
  settings: UserSettings;
  currentView: ViewType;
  selectedDate: Date;
}

// 时间线任务项（用于 react-calendar-timeline）- 使用时间戳
export interface TimelineTask {
  id: string;
  group: string;
  title: string;
  start_time: number; // 时间戳
  end_time: number; // 时间戳
  itemProps?: {
    className?: string;
    style?: React.CSSProperties;
  };
}

// 时间线分组
export interface TimelineGroup {
  id: string;
  title: string;
  rightTitle?: string;
}
