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
      <div style={{ padding: '24px' }}>
        <Title level={2} style={{ marginBottom: '24px', color: '#333' }}>
          本月概览
        </Title>

        <div style={{ marginBottom: '32px' }}>
          <StatisticsCard
            totalIncome={statistics?.totalIncome || 0}
            totalExpense={statistics?.totalExpense || 0}
            balance={statistics?.balance || 0}
          />
        </div>

        {/* 账户余额卡片 */}
        <Card
          style={{
            marginBottom: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
          bodyStyle={{ padding: '20px 24px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <WalletOutlined style={{ fontSize: '36px', color: 'white' }} />
              <div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '4px' }}>
                  账户总资产
                </div>
                <div style={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}>
                  ¥{accountsSummary.totalBalance.toFixed(2)}
                </div>
              </div>
            </div>
            <Space>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                  账户数量
                </div>
                <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                  {accountsSummary.accountCount}
                </div>
              </div>
              <Button
                type="primary"
                ghost
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/accounts')}
                style={{ borderRadius: '20px', borderColor: 'white', color: 'white' }}
              >
                管理账户
              </Button>
            </Space>
          </div>
        </Card>

        <Row gutter={24}>
          <Col span={12}>
            <div style={{ marginBottom: '24px' }}>
              <QuickAdd categories={categories} />
            </div>
            <RecentTransactions transactions={recentTransactions} />
          </Col>
          <Col span={12}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              padding: '24px'
            }}>
              <PieChart data={statistics?.categoryStats || []} />
            </div>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default Home;