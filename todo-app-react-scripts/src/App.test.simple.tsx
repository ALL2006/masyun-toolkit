import React from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useTaskStore } from './store/taskStore';

// 测试：不导入 TimelineView
function TestContent() {
  const { tasks } = useTaskStore();

  return (
    <div style={{ padding: '20px' }}>
      <h1>TimelineFlow 测试</h1>
      <p>✓ React 基础运行正常</p>
      <p>✓ zustand store 工作正常</p>
      <p>✓ ErrorBoundary 工作正常</p>
      <p>✓ 当前任务数: {tasks.length}</p>
      <p style={{ color: 'red' }}>TimelineView 组件导致白屏，已移除</p>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <TestContent />
    </ErrorBoundary>
  );
}

export default App;
