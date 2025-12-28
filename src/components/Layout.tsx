import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Button, Space, message } from 'antd';
import { PlusOutlined, BarChartOutlined, DatabaseOutlined, HomeOutlined, WalletOutlined, DollarOutlined, FileExcelOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingUpdate, setCheckingUpdate] = useState(false);

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
          大学生记账本
        </div>
        
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ 
            flex: 1, 
            minWidth: 0,
            background: 'transparent',
            border: 'none'
          }}
        />
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/add')}
          style={{
            background: '#52C41A',
            borderColor: '#52C41A',
            borderRadius: '20px',
            fontWeight: 'bold'
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
            borderRadius: '20px'
          }}
        >
          检查更新
        </Button>
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