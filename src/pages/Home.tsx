import React, { useEffect, useState } from 'react';
import { Row, Col, Spin, Typography, Card, Space, Button } from 'antd';
import { WalletOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatisticsCard from '../components/StatisticsCard';
import PieChart from '../components/PieChart';
import QuickAdd from '../components/QuickAdd';
import RecentTransactions from '../components/RecentTransactions';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { accountService } from '../services/accountService';
import { getCurrentMonthRange } from '../utils/date';
import { Transaction, Category, Statistics, Account } from '../types';

const { Title } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsSummary, setAccountsSummary] = useState({
    totalBalance: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    accountCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { start, end } = getCurrentMonthRange();

      const [stats, recent, cats, accs, summary] = await Promise.all([
        transactionService.getStatistics(start, end),
        transactionService.getRecentTransactions(5),
        categoryService.getAllCategories(),
        accountService.getAllAccounts(),
        accountService.getAccountsSummary()
      ]);

      setStatistics(stats);
      setRecentTransactions(recent);
      setCategories(cats);
      setAccounts(accs);
      setAccountsSummary(summary);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mobile-container">
        {/* 页面标题卡片 */}
        <Card
          style={{
            marginBottom: '16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: '16px 20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginBottom: '4px', fontWeight: 'normal' }}>
                财务概览
              </div>
              <Title level={2} style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                本月概览
              </Title>
            </div>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              📊
            </div>
          </div>
        </Card>

        {/* 统计卡片 */}
        <div style={{ marginBottom: '16px' }}>
          <StatisticsCard
            totalIncome={statistics?.totalIncome || 0}
            totalExpense={statistics?.totalExpense || 0}
            balance={statistics?.balance || 0}
          />
        </div>

        {/* 账户余额卡片 */}
        <Card
          className="stat-card"
          style={{
            marginBottom: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
          bodyStyle={{ padding: '16px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <WalletOutlined style={{ fontSize: '28px', color: 'white' }} />
              <div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginBottom: '2px' }}>
                  账户总资产
                </div>
                <div style={{ color: 'white', fontSize: '22px', fontWeight: 'bold' }}>
                  ¥{accountsSummary.totalBalance.toFixed(2)}
                </div>
              </div>
            </div>
            <Space size="small">
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                  账户
                </div>
                <div style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
                  {accountsSummary.accountCount}
                </div>
              </div>
              <Button
                type="primary"
                size="small"
                ghost
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/accounts')}
                style={{ borderRadius: '16px', borderColor: 'white', color: 'white', fontSize: '12px' }}
              >
                管理
              </Button>
            </Space>
          </div>
        </Card>

        {/* 响应式布局 */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <div style={{ marginBottom: '16px' }}>
              <QuickAdd categories={categories} />
            </div>
            <RecentTransactions transactions={recentTransactions} />
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} xl={12}>
            <div className="chart-container" style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              padding: '16px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 25%, #45B7D1 50%, #96CEB4 75%, #FFEAA7 100%)'
              }} />
              <PieChart data={statistics?.categoryStats || []} />
            </div>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default Home;