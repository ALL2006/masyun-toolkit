import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { Form, Input, Button, Select, DatePicker, Radio, Card, Typography, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import AccountSelector from '../components/AccountSelector';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { accountService } from '../services/accountService';
import { Category, Account } from '../types';
import { formatDate } from '../utils/date';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface LocationState {
  category?: Category;
}

const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    loadCategories();
    loadAccounts();

    // 如果有预设分类，设置默认值
    const state = location.state as LocationState;
    if (state?.category) {
      form.setFieldsValue({
        category: state.category.id,
        type: state.category.type
      });
      setTransactionType(state.category.type);
    }
  }, [location.state, form]);

  const loadCategories = async () => {
    try {
      const allCategories = await categoryService.getAllCategories();
      setCategories(allCategories);
    } catch (error) {
      message.error('加载分类失败');
    }
  };

  const loadAccounts = async () => {
    try {
      const allAccounts = await accountService.getAllAccounts();
      setAccounts(allAccounts);
      // 设置默认账户
      if (allAccounts.length > 0) {
        form.setFieldValue('accountId', allAccounts[0].id);
      }
    } catch (error) {
      message.error('加载账户失败');
    }
  };

  const handleTypeChange = (e: any) => {
    setTransactionType(e.target.value);
    form.setFieldsValue({ category: undefined });
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const transactionData = {
        type: values.type,
        amount: parseFloat(values.amount),
        category: values.category,
        accountId: values.accountId || 'default',
        description: values.description || '',
        date: formatDate(values.date.toDate())
      };

      await transactionService.addTransaction(transactionData);

      message.success('记账成功！');
      navigate('/');
    } catch (error) {
      message.error('记账失败，请重试');
      console.error('添加交易失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCategories = () => {
    return categories.filter(cat => cat.type === transactionType);
  };

  return (
    <Layout>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
        >
          <Title level={2} style={{ textAlign: 'center', marginBottom: '32px', color: '#333' }}>
            添加记录
          </Title>
          
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          initialValues={{
            type: 'expense',
            date: dayjs(),
            amount: ''
          }}
          >
            <Form.Item
              label="类型"
              name="type"
              rules={[{ required: true, message: '请选择类型' }]}
            >
              <Radio.Group
                onChange={handleTypeChange}
                buttonStyle="solid"
                style={{ width: '100%' }}
              >
                <Radio.Button 
                  value="expense" 
                  style={{ width: '50%', textAlign: 'center' }}
                >
                  支出
                </Radio.Button>
                <Radio.Button 
                  value="income" 
                  style={{ width: '50%', textAlign: 'center' }}
                >
                  收入
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="金额"
              name="amount"
              rules={[
                { required: true, message: '请输入金额' },
                { pattern: /^\d+\.?\d{0,2}$/, message: '请输入有效的金额' }
              ]}
            >
              <Input
                prefix="¥"
                placeholder="0.00"
                size="large"
                style={{ fontSize: '18px', fontWeight: 'bold' }}
              />
            </Form.Item>

            <Form.Item
              label="分类"
              name="category"
              rules={[{ required: true, message: '请选择分类' }]}
            >
              <Select
                placeholder="选择分类"
                size="large"
                style={{ width: '100%' }}
              >
                {getFilteredCategories().map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="账户"
              name="accountId"
              rules={[{ required: true, message: '请选择账户' }]}
            >
              <AccountSelector
                accounts={accounts}
                placeholder="选择账户"
                style={{ width: '100%' }}
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="日期"
              name="date"
              rules={[{ required: true, message: '请选择日期' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                size="large"
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item
              label="备注"
              name="description"
            >
              <TextArea
                placeholder="添加备注（可选）"
                rows={3}
                maxLength={100}
                showCount
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  style={{
                    flex: 1,
                    background: '#52C41A',
                    borderColor: '#52C41A',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    height: '48px'
                  }}
                >
                  保存
                </Button>
                <Button
                  size="large"
                  onClick={() => navigate('/')}
                  style={{
                    flex: 1,
                    borderRadius: '8px',
                    height: '48px'
                  }}
                >
                  取消
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </Layout>
  );
};

export default AddTransaction;
