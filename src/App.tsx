import React, { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { initDB } from './db/database';
import UpdateNotification from './components/UpdateNotification';
import FloatingAddButton from './components/FloatingAddButton';
import { isMobile } from './utils/device';
import Home from './pages/Home';
import AddTransaction from './pages/AddTransaction';
import Statistics from './pages/Statistics';
import DataManagement from './pages/DataManagement';
import AccountManagement from './pages/AccountManagement';
import BudgetManagement from './pages/BudgetManagement';
import ReportExport from './pages/ReportExport';
import AIAnalysis from './pages/AIAnalysis';

const App: React.FC = () => {
  const mobile = isMobile();

  useEffect(() => {
    // 初始化数据库
    initDB().catch(console.error);

    // 添加全局页面过渡动画
    const style = document.createElement('style');
    style.innerHTML = `
      /* 页面内容淡入动画 */
      .mobile-container, .ant-layout-content {
        animation: fadeInUp 0.4s ease-out;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* 所有按钮的点击波纹效果增强 */
      .ant-btn {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      .ant-btn:active {
        transform: scale(0.97) !important;
      }

      /* 卡片进入动画 */
      .ant-card {
        animation: cardFadeIn 0.5s ease-out;
      }

      @keyframes cardFadeIn {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* 平滑滚动 */
      * {
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // 使用 HashRouter 以兼容 Electron 的 file:// 协议
  // BrowserRouter 在 file:// 协议下会导致白屏问题
  const Router = HashRouter;

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#4A90E2',
          colorSuccess: '#52C41A',
          colorWarning: '#FFA940',
          colorError: '#FF6B6B',
          borderRadius: 8,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          motionDurationSlow: '0.4s',
          motionDurationFast: '0.2s',
        },
        components: {
          Button: {
            borderRadius: 8,
          },
          Card: {
            borderRadius: mobile ? 12 : 16,
          },
          Input: {
            borderRadius: 8,
          },
          Select: {
            borderRadius: 8,
          },
          DatePicker: {
            borderRadius: 8,
          },
        },
      }}
    >
      <AntdApp>
        {/* 仅桌面端显示更新通知和浮动按钮 */}
        {!mobile && <UpdateNotification />}
        {!mobile && <FloatingAddButton />}

        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/data" element={<DataManagement />} />
            <Route path="/accounts" element={<AccountManagement />} />
            <Route path="/budgets" element={<BudgetManagement />} />
            <Route path="/report" element={<ReportExport />} />
            <Route path="/ai-analysis" element={<AIAnalysis />} />
          </Routes>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
