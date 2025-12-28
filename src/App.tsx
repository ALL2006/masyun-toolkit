import React, { useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { initDB } from './db/database';
import UpdateNotification from './components/UpdateNotification';
import FloatingAddButton from './components/FloatingAddButton';
import Home from './pages/Home';
import AddTransaction from './pages/AddTransaction';
import Statistics from './pages/Statistics';
import DataManagement from './pages/DataManagement';
import AccountManagement from './pages/AccountManagement';
import BudgetManagement from './pages/BudgetManagement';
import ReportExport from './pages/ReportExport';

const App: React.FC = () => {
  useEffect(() => {
    // 初始化数据库
    initDB().catch(console.error);
  }, []);

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
        },
        components: {
          Button: {
            borderRadius: 8,
          },
          Card: {
            borderRadius: 16,
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
        <UpdateNotification />
        <FloatingAddButton />
        {(window.location.protocol === 'file:' ? (
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/data" element={<DataManagement />} />
            <Route path="/accounts" element={<AccountManagement />} />
            <Route path="/budgets" element={<BudgetManagement />} />
            <Route path="/report" element={<ReportExport />} />
          </Routes>
        </HashRouter>
      ) : (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/data" element={<DataManagement />} />
            <Route path="/accounts" element={<AccountManagement />} />
            <Route path="/budgets" element={<BudgetManagement />} />
            <Route path="/report" element={<ReportExport />} />
          </Routes>
        </BrowserRouter>
      ))}
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
