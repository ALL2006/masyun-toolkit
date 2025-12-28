import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Typography,
  Space,
  DatePicker,
  Statistic,
  Alert
} from 'antd';
import {
  PlusOutlined,
  WarningOutlined,
  DollarOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import Layout from '../components/Layout';
import BudgetProgressCard from '../components/BudgetProgressCard';
import { budgetService } from '../services/budgetService';
import { categoryService } from '../services/categoryService';
import { Category, BudgetExecution } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const BudgetManagement: React.FC = () => {
  const [budgetExecutions, setBudgetExecutions] = useState<BudgetExecution[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [form] = Form.useForm();
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    budgetCount: 0,
    overBudgetCount: 0,
    warningCount: 0
  });

  useEffect(() => {
    loadData();
    loadCategories();
  }, [selectedYear, selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [executions, summaryData] = await Promise.all([
        budgetService.getBudgetExecution(selectedYear, selectedMonth),
        budgetService.getBudgetSummary(selectedYear, selectedMonth)
      ]);
      setBudgetExecutions(executions);
      setSummary(summaryData);
    } catch (error) {
      message.error('加载预算数据失败');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const allCategories = await categoryService.getAllCategories();
      // 只显示支出分类
      setCategories(allCategories.filter(c => c.type === 'expense'));
    } catch (error) {
      message.error('加载分类失败');
    }
  };

  const handleAdd = () => {
    form.resetFields();
    form.setFieldsValue({
      year: dayjs().year(selectedYear),
      month: dayjs().month(selectedMonth - 1),
      alertThreshold: 80
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const category = categories.find(c => c.id === values.categoryId);

      if (!category) {
        message.error('请选择分类');
        return;
      }

      await budgetService.setBudget(
        values.categoryId,
        category.name,
        values.amount,
        values.year.year(),
        values.month.month() + 1,
        values.alertThreshold
      );

      message.success('预算设置成功');
      setModalVisible(false);
      loadData();
    } catch (error) {
      // 表单验证失败
    }
  };

  const handleDelete = async (budgetId: string) => {
    try {
      await budgetService.deleteBudget(budgetId);
      message.success('预算已删除');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const months = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#333' }}>
            预算管理
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
            style={{ borderRadius: '8px', background: '#4A90E2', borderColor: '#4A90E2' }}
          >
            设置预算
          </Button>
        </div>

        {/* 月份选择 */}
        <Card style={{ marginBottom: '24px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}>
          <Space size="large" align="center">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CalendarOutlined style={{ fontSize: '18px', color: '#4A90E2' }} />
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                style={{ width: 120 }}
                size="large"
              >
                {years.map(year => (
                  <Select.Option key={year} value={year}>
                    {year}年
                  </Select.Option>
                ))}
              </Select>
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                style={{ width: 100 }}
                size="large"
              >
                {months.map((month, index) => (
                  <Select.Option key={index + 1} value={index + 1}>
                    {month}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </Space>
        </Card>

        {/* 汇总统计 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <Statistic
                title="总预算"
                value={summary.totalBudget}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#4A90E2', fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <Statistic
                title="已支出"
                value={summary.totalSpent}
                precision={0}
                prefix="¥"
                valueStyle={{ color: '#FF6B6B', fontSize: '20px' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <Statistic
                title="剩余"
                value={summary.totalRemaining}
                precision={0}
                prefix="¥"
                valueStyle={{
                  color: summary.totalRemaining >= 0 ? '#52C41A' : '#FF6B6B',
                  fontSize: '20px'
                }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
              <Statistic
                title="预算数量"
                value={summary.budgetCount}
                suffix={`个`}
                valueStyle={{ color: '#4A90E2', fontSize: '20px' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 预警提示 */}
        {(summary.overBudgetCount > 0 || summary.warningCount > 0) && (
          <Alert
            message="预算预警"
            description={
              <span>
                有 {summary.overBudgetCount} 个分类已超支，{summary.warningCount} 个分类接近预算上限
              </span>
            }
            type="warning"
            showIcon
            style={{ marginBottom: '24px', borderRadius: '8px' }}
          />
        )}

        {/* 预算进度卡片列表 */}
        <Title level={4} style={{ color: '#333', marginBottom: '16px' }}>
          预算执行情况
        </Title>

        {budgetExecutions.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '48px', borderRadius: '16px' }}>
            <DollarOutlined style={{ fontSize: '48px', color: '#D9D9D9', marginBottom: '16px' }} />
            <Text type="secondary" style={{ fontSize: '16px' }}>
              暂无预算设置，点击"设置预算"开始管理您的支出
            </Text>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {budgetExecutions.map(execution => (
              <Col xs={24} sm={12} md={8} key={execution.budgetId}>
                <BudgetProgressCard execution={execution} />
              </Col>
            ))}
          </Row>
        )}

        {/* 设置预算模态框 */}
        <Modal
          title="设置预算"
          open={modalVisible}
          onOk={handleSave}
          onCancel={() => setModalVisible(false)}
          okText="保存"
          cancelText="取消"
          width={500}
        >
          <Form form={form} layout="vertical" style={{ marginTop: '24px' }}>
            <Form.Item
              name="categoryId"
              label="分类"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select placeholder="选择分类">
                {categories.map(category => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label="预算金额"
              rules={[{ required: true, message: '请输入预算金额' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0.00"
                precision={0}
                min={1}
                prefix="¥"
              />
            </Form.Item>

            <Form.Item
              name="alertThreshold"
              label="预警阈值 (%)"
              rules={[{ required: true, message: '请输入预警阈值' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                max={100}
                suffix="%"
              />
            </Form.Item>

            <Form.Item label="预算月份">
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="year" noStyle>
                  <DatePicker
                    picker="year"
                    placeholder="选择年份"
                    style={{ width: '50%' }}
                  />
                </Form.Item>
                <Form.Item name="month" noStyle>
                  <DatePicker
                    picker="month"
                    placeholder="选择月份"
                    style={{ width: '50%' }}
                  />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default BudgetManagement;
