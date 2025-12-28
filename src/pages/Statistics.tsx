import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Typography, Row, Col, Statistic, Spin, Input, Select, Space, Button, Modal, message } from 'antd';
import { SearchOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import Layout from '../components/Layout';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { getDateRange } from '../utils/date';
import { Transaction, Statistics, TimeRange, Category } from '../types';

const { Title } = Typography;
const { TabPane } = Tabs;

const StatisticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // 搜索和筛选状态
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string | undefined>();

  // 批量操作状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    loadData();
  }, [timeRange]);

  useEffect(() => {
    // 应用搜索和筛选
    applyFilters();
  }, [transactions, searchText, filterType, filterCategory]);

  const applyFilters = () => {
    let filtered = [...transactions];

    // 按类型筛选
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // 按分类筛选
    if (filterCategory) {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    // 按搜索文本筛选
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTransactions(filtered);
  };

  const resetFilters = () => {
    setSearchText('');
    setFilterType('all');
    setFilterCategory(undefined);
  };

  // 批量删除功能
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的记录');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          for (const id of selectedRowKeys) {
            await transactionService.deleteTransaction(id as string);
          }
          message.success(`成功删除 ${selectedRowKeys.length} 条记录`);
          setSelectedRowKeys([]);
          await loadData();
        } catch (error) {
          message.error('删除失败，请重试');
          console.error('批量删除失败:', error);
        }
      }
    });
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange(timeRange);

      const [trans, stats, cats] = await Promise.all([
        transactionService.getTransactionsByDateRange(start, end),
        transactionService.getStatistics(start, end),
        categoryService.getAllCategories()
      ]);

      setTransactions(trans);
      setStatistics(stats);
      setCategories(cats);
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
      width: 120
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <span style={{ 
          color: type === 'income' ? '#52C41A' : '#FF6B6B',
          fontWeight: 'bold'
        }}>
          {type === 'income' ? '收入' : '支出'}
        </span>
      ),
      width: 80
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Transaction) => (
        <span style={{ 
          color: record.type === 'income' ? '#52C41A' : '#FF6B6B',
          fontWeight: 'bold'
        }}>
          {formatCurrency(amount)}
        </span>
      ),
      width: 120
    },
    {
      title: '备注',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || '-',
      ellipsis: true
    }
  ];

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
          统计分析
        </Title>

        <Tabs
          activeKey={timeRange}
          onChange={(key) => setTimeRange(key as TimeRange)}
          style={{ marginBottom: '24px' }}
        >
          <TabPane tab="日视图" key="day" />
          <TabPane tab="周视图" key="week" />
          <TabPane tab="月视图" key="month" />
        </Tabs>

        {/* 搜索和筛选区域 */}
        <Card
          style={{
            marginBottom: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space wrap>
              <Input
                placeholder="搜索备注或分类..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 240 }}
                allowClear
              />
              <Select
                placeholder="筛选类型"
                value={filterType}
                onChange={setFilterType}
                style={{ width: 120 }}
              >
                <Select.Option value="all">全部</Select.Option>
                <Select.Option value="income">收入</Select.Option>
                <Select.Option value="expense">支出</Select.Option>
              </Select>
              <Select
                placeholder="筛选分类"
                value={filterCategory}
                onChange={setFilterCategory}
                style={{ width: 140 }}
                allowClear
              >
                {categories
                  .filter(c => c.type === 'expense' || filterType !== 'expense')
                  .map(cat => (
                    <Select.Option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </Select.Option>
                  ))}
              </Select>
            </Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={resetFilters}
            >
              重置筛选
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
              >
                删除选中 ({selectedRowKeys.length})
              </Button>
            )}
          </Space>
          {filteredTransactions.length !== transactions.length && (
            <div style={{ marginTop: '12px', color: '#888', fontSize: '14px' }}>
              找到 {filteredTransactions.length} 条记录（共 {transactions.length} 条）
            </div>
          )}
        </Card>

        {/* 统计概览 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              <Statistic
                title="总收入"
                value={statistics?.totalIncome || 0}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#52C41A', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              <Statistic
                title="总支出"
                value={statistics?.totalExpense || 0}
                precision={2}
                prefix="¥"
                valueStyle={{ color: '#FF6B6B', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              <Statistic
                title="结余"
                value={statistics?.balance || 0}
                precision={2}
                prefix="¥"
                valueStyle={{ 
                  color: (statistics?.balance || 0) >= 0 ? '#52C41A' : '#FFA940', 
                  fontSize: '24px' 
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* 图表区域 */}
        <Row gutter={24}>
          <Col span={12}>
            <Card 
              title="收支趋势" 
              style={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            >
              <BarChart data={transactions} title={`${timeRange === 'day' ? '今日' : timeRange === 'week' ? '本周' : '本月'}收支趋势`} />
            </Card>
          </Col>
          <Col span={12}>
            <Card 
              title="分类占比" 
              style={{ 
                borderRadius: '16px', 
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                border: 'none'
              }}
            >
              <PieChart data={statistics?.categoryStats || []} title={`${timeRange === 'day' ? '今日' : timeRange === 'week' ? '本周' : '本月'}支出分类`} />
            </Card>
          </Col>
        </Row>

        {/* 详细数据表格 */}
        <Card 
          title="详细记录" 
          style={{ 
            marginTop: '24px',
            borderRadius: '16px', 
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            border: 'none'
          }}
        >
          <Table
            dataSource={filteredTransactions}
            columns={columns}
            rowKey="id"
            rowSelection={rowSelection}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条记录`
            }}
            scroll={{ x: 600 }}
            locale={{
              emptyText: '暂无记录'
            }}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default StatisticsPage;