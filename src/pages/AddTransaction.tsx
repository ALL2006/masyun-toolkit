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

const { Title } = Typography;
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
      <div className="mobile-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* 页面标题卡片 */}
        <Card
          style={{
            marginBottom: '24px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #4A90E2 0%, #6BA7F8 100%)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(74, 144, 226, 0.3)',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: '16px 20px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginBottom: '4px' }}>
                记账
              </div>
              <Title level={2} style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                添加记录
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
              💰
            </div>
          </div>
        </Card>

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
                style={{ width: '50%', textAlign: 'center', borderRadius: '12px 0 0 12px' }}
              >
                支出
              </Radio.Button>
              <Radio.Button
                value="income"
                style={{ width: '50%', textAlign: 'center', borderRadius: '0 12px 12px 0' }}
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
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                borderRadius: '12px',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.2)';
                e.currentTarget.style.borderColor = '#4A90E2';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#d9d9d9';
              }}
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
              style={{ width: '100%', borderRadius: '12px' }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
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
              style={{ width: '100%', borderRadius: '12px' }}
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
              style={{ borderRadius: '12px', transition: 'all 0.3s ease' }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74, 144, 226, 0.2)';
                e.currentTarget.style.borderColor = '#4A90E2';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#d9d9d9';
              }}
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
                  background: 'linear-gradient(135deg, #52C41A 0%, #73D13D 100%)',
                  borderColor: 'transparent',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  height: '48px',
                  boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(82, 196, 26, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.3)';
                }}
              >
                保存
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/')}
                style={{
                  flex: 1,
                  borderRadius: '12px',
                  height: '48px',
                  transition: 'all 0.3s ease'
                }}
              >
                取消
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    </Layout>
  );
};

export default AddTransaction;
