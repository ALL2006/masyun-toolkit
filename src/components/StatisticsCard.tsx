import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined } from '@ant-design/icons';

interface StatisticsCardProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ totalIncome, totalExpense, balance }) => {
  return (
    <Row gutter={16}>
      <Col span={8}>
        <Card
          style={{
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #52C41A 0%, #73D13D 100%)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(82, 196, 26, 0.3)'
          }}
        >
          <Statistic
            title={<span style={{ color: 'white', fontSize: '14px' }}>本月收入</span>}
            value={totalIncome}
            precision={2}
            prefix={<span style={{ color: 'white' }}>¥</span>}
            suffix={<ArrowUpOutlined style={{ color: 'white' }} />}
            valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card
          style={{
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(255, 107, 107, 0.3)'
          }}
        >
          <Statistic
            title={<span style={{ color: 'white', fontSize: '14px' }}>本月支出</span>}
            value={totalExpense}
            precision={2}
            prefix={<span style={{ color: 'white' }}>¥</span>}
            suffix={<ArrowDownOutlined style={{ color: 'white' }} />}
            valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card
          style={{
            borderRadius: '16px',
            background: balance >= 0 
              ? 'linear-gradient(135deg, #4A90E2 0%, #6BA7F8 100%)'
              : 'linear-gradient(135deg, #FFA940 0%, #FFC069 100%)',
            border: 'none',
            boxShadow: `0 4px 16px rgba(${balance >= 0 ? '74, 144, 226' : '255, 169, 64'}, 0.3)`
          }}
        >
          <Statistic
            title={<span style={{ color: 'white', fontSize: '14px' }}>本月结余</span>}
            value={Math.abs(balance)}
            precision={2}
            prefix={<span style={{ color: 'white' }}>¥</span>}
            suffix={<DollarOutlined style={{ color: 'white' }} />}
            valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default StatisticsCard;