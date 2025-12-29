import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Button, Badge } from 'antd';
import {
  PlusOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  HomeOutlined,
  WalletOutlined,
  DollarOutlined,
  FileExcelOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Content, Footer } = AntLayout;

interface MobileLayoutProps {
  children: React.ReactNode;
}

// 移动端底部导航菜单项
const mobileMenuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: '首页'
  },
  {
    key: '/statistics',
    icon: <BarChartOutlined />,
    label: '统计'
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
    key: '/report',
    icon: <FileExcelOutlined />,
    label: '报表'
  },
  {
    key: '/ai-analysis',
    icon: <BulbOutlined />,
    label: 'AI'
  },
  {
    key: '/data',
    icon: <DatabaseOutlined />,
    label: '数据'
  }
];

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 添加记账
  const handleAddTransaction = () => {
    navigate('/add');
  };

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* 顶部标题栏 */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'linear-gradient(135deg, #4A90E2 0%, #52C41A 100%)',
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          大学生记账本
        </div>
      </div>

      {/* 内容区域 */}
      <Content style={{
        flex: 1,
        overflow: 'auto',
        paddingBottom: '80px' // 为底部导航栏留空间
      }}>
        {children}
      </Content>

      {/* 底部导航栏 */}
      <Footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '8px 12px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        zIndex: 999,
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)'
      }}>
        {/* 可滑动菜单 */}
        <div style={{
          display: 'flex',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          width: '100%',
          padding: '0 4px',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        } as React.CSSProperties}>
          {mobileMenuItems.map((item) => {
            const isSelected = location.pathname === item.key;
            return (
              <div
                key={item.key}
                onClick={() => navigate(item.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '58px',
                  padding: '6px 10px',
                  margin: '0 2px',
                  borderRadius: '14px',
                  background: isSelected ? 'linear-gradient(135deg, #4A90E2 0%, #6BA7F8 100%)' : 'transparent',
                  color: isSelected ? 'white' : '#999',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 4px 12px rgba(74, 144, 226, 0.35)' : 'none',
                  transform: isSelected ? 'translateY(-2px)' : 'translateY(0)'
                }}
              >
                <div style={{
                  fontSize: isSelected ? '22px' : '20px',
                  marginBottom: '2px',
                  transition: 'all 0.3s ease'
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: isSelected ? '11px' : '10px',
                  fontWeight: isSelected ? 'bold' : 'normal'
                }}>
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* 浮动记账按钮 */}
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          onClick={handleAddTransaction}
          style={{
            position: 'fixed',
            bottom: '85px',
            right: '20px',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #52C41A 0%, #73D13D 100%)',
            border: 'none',
            boxShadow: '0 6px 20px rgba(82, 196, 26, 0.45)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(82, 196, 26, 0.55)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(82, 196, 26, 0.45)';
          }}
        />
      </Footer>
    </AntLayout>
  );
};

export default MobileLayout;
