import React from 'react';
import { List, Card, Typography, Tag } from 'antd';
import { Transaction } from '../types';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const formatCurrency = (amount: number) => {
    return `¥${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  return (
    <Card
      style={{
        borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        border: 'none'
      }}
    >
      <Title level={4} style={{ marginBottom: '16px', color: '#333' }}>
        最近记录
      </Title>

      {transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          暂无记录，点击上方记账按钮开始记录吧！
        </div>
      ) : (
        <List
          dataSource={transactions}
          renderItem={(transaction, index) => (
            <Card
              key={transaction.id || index}
              style={{
                marginBottom: index < transactions.length - 1 ? '12px' : '0',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.3s ease',
                cursor: 'default'
              }}
              bodyStyle={{ padding: '12px 16px' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                e.currentTarget.style.borderColor = transaction.type === 'income' ? 'rgba(82, 196, 26, 0.3)' : 'rgba(255, 107, 107, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: transaction.type === 'income'
                        ? 'linear-gradient(135deg, #52C41A 0%, #73D13D 100%)'
                        : 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: 'white',
                      boxShadow: transaction.type === 'income'
                        ? '0 4px 12px rgba(82, 196, 26, 0.3)'
                        : '0 4px 12px rgba(255, 107, 107, 0.3)'
                    }}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpOutlined />
                    ) : (
                      <ArrowDownOutlined />
                    )}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '15px', color: '#333' }}>
                      {transaction.category}
                    </Text>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                      {transaction.description || '无备注'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <Text
                    strong
                    style={{
                      fontSize: '17px',
                      color: transaction.type === 'income' ? '#52C41A' : '#FF6B6B'
                    }}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                    {formatDate(transaction.date)}
                  </div>
                </div>
              </div>
            </Card>
          )}
        />
      )}
    </Card>
  );
};

export default RecentTransactions;