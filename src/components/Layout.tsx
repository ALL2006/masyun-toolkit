import React, { useState } from 'react';
import { Layout as AntLayout, Button, Space, message } from 'antd';
import { PlusOutlined, BarChartOutlined, DatabaseOutlined, HomeOutlined, WalletOutlined, DollarOutlined, FileExcelOutlined, ReloadOutlined, BulbOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { isMobile, isElectron } from '../utils/device';
import MobileLayout from './MobileLayout';

const { Header, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  // 检测是否为移动端
  const mobile = isMobile();

  // 手动检查更新
  const handleCheckUpdate = async () => {
    // 仅在 Electron 环境中执行
    if (window.require) {
      try {
        setCheckingUpdate(true);
        const { ipcRenderer } = window.require('electron');
        const result = await ipcRenderer.invoke('check-for-updates');
        if (result.success) {
          message.info('正在检查更新...');
        } else {
          message.error('检查更新失败: ' + result.error);
        }
      } catch (error) {
        message.error('检查更新失败');
        console.error('检查更新错误:', error);
      } finally {
        setCheckingUpdate(false);
      }
    } else {
      message.info('更新功能仅在桌面应用中可用');
    }
  };

  // 移动端使用底部导航栏布局
  if (mobile) {
    return <MobileLayout>{children}</MobileLayout>;
  }

  // 桌面端菜单项
  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: '/accounts',
      icon: <WalletOutlined />,
      label: '账户'
    },
    {
      key: '/budgets',
      icon: <DollarOutlined />,
      label: '预算'
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: '统计'
    },
    {
      key: '/report',
      icon: <FileExcelOutlined />,
      label: '报表'
    },
    {
      key: '/ai-analysis',
      icon: <BulbOutlined />,
      label: 'AI分析'
    },
    {
      key: '/data',
      icon: <DatabaseOutlined />,
      label: '数据管理'
    }
  ];

  return (
    <AntLayout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #4A90E2 0%, #52C41A 100%)' }}>
      <Header style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        <div style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          marginRight: '48px'
        }}>
          大学生记账本 <span style={{ fontSize: '14px', fontWeight: 'normal' }}>v0.3.2</span>
        </div>

        {/* 药丸按钮导航 */}
        <Space size="small" style={{ flex: 1, minWidth: 0 }}>
          {menuItems.map((item) => (
            <Button
              key={item.key}
              icon={item.icon}
              onClick={() => navigate(item.key)}
              style={{
                background: location.pathname === item.key
                  ? 'rgba(255, 255, 255, 0.95)'
                  : 'rgba(255, 255, 255, 0.15)',
                borderColor: location.pathname === item.key
                  ? 'rgba(255, 255, 255, 0.3)'
                  : 'rgba(255, 255, 255, 0.25)',
                color: location.pathname === item.key
                  ? '#4A90E2'
                  : 'white',
                borderRadius: '20px',
                fontWeight: location.pathname === item.key ? 'bold' : 'normal',
                transition: 'all 0.3s ease',
                boxShadow: location.pathname === item.key
                  ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                  : 'none',
                height: '36px'
              }}
            >
              {item.label}
            </Button>
          ))}
        </Space>

        <Space size="middle">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/add')}
            style={{
              background: 'linear-gradient(135deg, #52C41A 0%, #73D13D 100%)',
              borderColor: 'transparent',
              borderRadius: '20px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(82, 196, 26, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(82, 196, 26, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.4)';
            }}
          >
            记账
          </Button>

          <Button
            icon={<ReloadOutlined spin={checkingUpdate} />}
            onClick={handleCheckUpdate}
            loading={checkingUpdate}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              borderRadius: '20px',
              transition: 'all 0.3s ease'
            }}
          >
            检查更新
          </Button>
        </Space>
      </Header>

      <Content style={{
        margin: '24px',
        padding: '24px',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        minHeight: 'calc(100vh - 120px)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout;