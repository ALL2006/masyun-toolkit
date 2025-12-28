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
          renderItem={(transaction) => (
            <List.Item
              style={{
                padding: '12px 0',
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: transaction.type === 'income' ? '#52C41A20' : '#FF6B6B20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpOutlined style={{ color: '#52C41A' }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: '#FF6B6B' }} />
                    )}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: '14px' }}>
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
                      fontSize: '16px',
                      color: transaction.type === 'income' ? '#52C41A' : '#FF6B6B'
                    }}
                  >
                    {formatCurrency(transaction.amount)}
                  </Text>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                    {formatDate(transaction.date)}
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

export default RecentTransactions;