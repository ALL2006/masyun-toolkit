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
  Divider,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapRightOutlined,
  WalletOutlined
} from '@ant-design/icons';
import Layout from '../components/Layout';
import { accountService } from '../services/accountService';
import { Account, AccountType } from '../types';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const AccountManagement: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [transferForm] = Form.useForm();

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAllAccounts();
      setAccounts(data);
    } catch (error) {
      message.error('加载账户失败');
    } finally {
      setLoading(false);
    }
  };

  // 计算汇总
  const summary = accounts.reduce(
    (acc, account) => {
      acc.totalBalance += account.balance;
      acc.count += 1;
      return acc;
    },
    { totalBalance: 0, count: 0 }
  );

  // 打开添加账户模态框
  const handleAdd = () => {
    setEditingAccount(null);
    form.resetFields();
    form.setFieldsValue({
      type: 'cash',
      initialBalance: 0,
      isActive: true
    });
    setModalVisible(true);
  };

  // 打开编辑账户模态框
  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    form.setFieldsValue(account);
    setModalVisible(true);
  };

  // 删除账户
  const handleDelete = async (id: string) => {
    try {
      await accountService.deleteAccount(id);
      message.success('账户已删除');
      loadAccounts();
    } catch (error: any) {
      message.error(error.message || '删除失败');
    }
  };

  // 保存账户
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const typeConfig = accountService.getAccountTypeConfig(values.type);

      if (editingAccount) {
        // 编辑模式：只更新可修改字段
        await accountService.updateAccount(editingAccount.id, {
          name: values.name,
          description: values.description,
          initialBalance: values.initialBalance
        });
        message.success('账户已更新');
      } else {
        // 新增模式
        await accountService.addAccount({
          name: values.name,
          type: values.type,
          icon: typeConfig.icon,
          color: typeConfig.color,
          balance: values.initialBalance,
          initialBalance: values.initialBalance,
          description: values.description,
          isActive: true,
          sortOrder: accounts.length
        });
        message.success('账户已添加');
      }

      setModalVisible(false);
      loadAccounts();
    } catch (error) {
      // 表单验证失败时，不关闭模态框
    }
  };

  // 打开转账模态框
  const handleOpenTransfer = () => {
    transferForm.resetFields();
    setTransferModalVisible(true);
  };

  // 执行转账
  const handleTransfer = async () => {
    try {
      const values = await transferForm.validateFields();

      await accountService.transfer(
        values.fromAccountId,
        values.toAccountId,
        values.amount,
        values.fee || 0,
        values.description
      );

      message.success('转账成功');
      setTransferModalVisible(false);
      loadAccounts();
    } catch (error: any) {
      if (error.message) {
        message.error(error.message);
      }
      // 表单验证失败时，不关闭模态框
    }
  };

  return (
    <Layout>
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#333' }}>
            账户管理
          </Title>
          <Space>
            <Button
              icon={<SwapRightOutlined />}
              onClick={handleOpenTransfer}
              size="large"
              style={{ borderRadius: '8px' }}
            >
              账户转账
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
              style={{ borderRadius: '8px', background: '#4A90E2', borderColor: '#4A90E2' }}
            >
              添加账户
            </Button>
          </Space>
        </div>

        {/* 汇总卡片 */}
        <Card
          style={{
            marginBottom: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            background: 'linear-gradient(135deg, #4A90E2 0%, #52C41A 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <WalletOutlined style={{ fontSize: '48px', color: 'white' }} />
            <div>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', display: 'block' }}>
                总资产
              </Text>
              <Title level={2} style={{ margin: 0, color: 'white', fontSize: '32px' }}>
                ¥{summary.totalBalance.toFixed(2)}
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                共 {summary.count} 个账户
              </Text>
            </div>
          </div>
        </Card>

        {/* 账户卡片列表 */}
        <Row gutter={[16, 16]}>
          {accounts.map(account => (
            <Col xs={24} sm={12} md={8} key={account.id}>
              <Card
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  border: 'none',
                  background: `linear-gradient(135deg, ${account.color}20 0%, ${account.color}40 100%)`
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px' }}>{account.icon}</span>
                      <Text strong style={{ fontSize: '16px', color: '#333' }}>
                        {account.name}
                      </Text>
                    </div>
                    <Title level={3} style={{ margin: 0, color: account.color, fontSize: '28px' }}>
                      ¥{account.balance.toFixed(2)}
                    </Title>
                    {account.description && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {account.description}
                      </Text>
                    )}
                  </div>
                  <Space direction="vertical" size="small">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(account)}
                      style={{ color: '#4A90E2' }}
                    >
                      编辑
                    </Button>
                    <Popconfirm
                      title="确认删除"
                      description="删除后将无法恢复"
                      onConfirm={() => handleDelete(account.id)}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Button type="text" icon={<DeleteOutlined />} danger>
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* 添加/编辑账户模态框 */}
        <Modal
          title={editingAccount ? '编辑账户' : '添加账户'}
          open={modalVisible}
          onOk={handleSave}
          onCancel={() => setModalVisible(false)}
          okText="保存"
          cancelText="取消"
          width={500}
        >
          <Form form={form} layout="vertical" style={{ marginTop: '24px' }}>
            <Form.Item
              name="name"
              label="账户名称"
              rules={[{ required: true, message: '请输入账户名称' }]}
            >
              <Input placeholder="如：招商银行储蓄卡" />
            </Form.Item>

            {!editingAccount && (
              <Form.Item
                name="type"
                label="账户类型"
                rules={[{ required: true, message: '请选择账户类型' }]}
              >
                <Select placeholder="选择账户类型">
                  {accountService.getAccountTypes().map(({ type, label, icon }) => (
                    <Select.Option key={type} value={type}>
                      {icon} {label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Form.Item
              name="initialBalance"
              label="初始余额"
              rules={[{ required: true, message: '请输入初始余额' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0.00"
                precision={2}
                min={0}
                prefix="¥"
              />
            </Form.Item>

            <Form.Item name="description" label="备注（可选）">
              <Input.TextArea placeholder="输入备注信息" rows={3} />
            </Form.Item>
          </Form>
        </Modal>

        {/* 账户转账模态框 */}
        <Modal
          title="账户转账"
          open={transferModalVisible}
          onOk={handleTransfer}
          onCancel={() => setTransferModalVisible(false)}
          okText="确认转账"
          cancelText="取消"
          width={500}
        >
          <Form form={transferForm} layout="vertical" style={{ marginTop: '24px' }}>
            <Form.Item
              name="fromAccountId"
              label="转出账户"
              rules={[{ required: true, message: '请选择转出账户' }]}
            >
              <Select placeholder="选择转出账户">
                {accounts.map(account => (
                  <Select.Option key={account.id} value={account.id}>
                    {account.icon} {account.name} (¥{account.balance.toFixed(2)})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="toAccountId"
              label="转入账户"
              dependencies={['fromAccountId']}
              rules={[
                { required: true, message: '请选择转入账户' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value && getFieldValue('fromAccountId') === value) {
                      return Promise.reject(new Error('转入账户不能与转出账户相同'));
                    }
                    return Promise.resolve();
                  }
                })
              ]}
            >
              <Select placeholder="选择转入账户">
                {accounts.map(account => (
                  <Select.Option key={account.id} value={account.id}>
                    {account.icon} {account.name} (¥{account.balance.toFixed(2)})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="amount"
              label="转账金额"
              rules={[{ required: true, message: '请输入转账金额' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0.00"
                precision={2}
                min={0.01}
                prefix="¥"
              />
            </Form.Item>

            <Form.Item name="fee" label="手续费（可选）">
              <InputNumber
                style={{ width: '100%' }}
                placeholder="0.00"
                precision={2}
                min={0}
                prefix="¥"
              />
            </Form.Item>

            <Form.Item name="description" label="备注（可选）">
              <Input placeholder="输入备注信息" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default AccountManagement;
