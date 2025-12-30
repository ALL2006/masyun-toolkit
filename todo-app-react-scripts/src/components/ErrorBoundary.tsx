import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary error info:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '50px',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: '#fff0f0',
          height: '100vh'
        }}>
          <h1 style={{ color: '#ff0000' }}>应用出错了</h1>
          <p><strong>错误信息:</strong></p>
          <pre style={{
            backgroundColor: '#f0f0f0',
            padding: '15px',
            borderRadius: '5px',
            overflow: 'auto'
          }}>
            {this.state.error?.stack || this.state.error?.message || '未知错误'}
          </pre>
          <div style={{ marginTop: '20px' }}>
            <button onClick={() => {
              localStorage.clear();
              window.location.href = './test.html';
            }} style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#1890FF',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}>
              清除数据并重试
            </button>
            <button onClick={() => window.location.href = './test.html'} style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#52c41a',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              打开测试页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
