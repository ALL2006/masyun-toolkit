import React from 'react';
import { Card, Progress, Typography, Space } from 'antd';
import { AlertOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { BudgetExecution } from '../types';

const { Text } = Typography;

interface BudgetProgressCardProps {
  execution: BudgetExecution;
}

const BudgetProgressCard: React.FC<BudgetProgressCardProps> = ({ execution }) => {
  // 根据状态选择颜色
  const getColor = () => {
    switch (execution.status) {
      case 'exceeded':
        return '#FF6B6B';
      case 'warning':
        return '#FFA940';
      default:
        return '#52C41A';
    }
  };

  // 进度条颜色
  const strokeColor = execution.percentage >= 100
    ? '#FF6B6B'
    : execution.percentage >= execution.budgetAmount * (execution.budgetAmount - 100) / 100
      ? '#FFA940'
      : '#52C41A';

  return (
    <Card
      style={{
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        border: 'none',
        background: execution.status === 'exceeded' ? '#FFF1F0' : '#fff'
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <Text strong style={{ fontSize: '15px', color: '#333' }}>
            {execution.categoryName}
          </Text>
          {execution.status === 'exceeded' && (
            <AlertOutlined style={{ color: '#FF6B6B', fontSize: '16px' }} />
          )}
          {execution.status === 'warning' && (
            <AlertOutlined style={{ color: '#FFA940', fontSize: '16px' }} />
          )}
          {execution.status === 'normal' && (
            <CheckCircleOutlined style={{ color: '#52C41A', fontSize: '16px' }} />
          )}
        </div>
        <Progress
          percent={Math.min(execution.percentage, 100)}
          strokeColor={getColor()}
          showInfo={false}
          strokeWidth={8}
          style={{ marginBottom: '8px' }}
        />
        <Space size="large">
          <Text type="secondary" style={{ fontSize: '12px' }}>
            预算: ¥{execution.budgetAmount.toFixed(0)}
          </Text>
          <Text style={{ fontSize: '12px', color: getColor(), fontWeight: 'bold' }}>
            已支出: ¥{execution.spentAmount.toFixed(0)}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            剩余: ¥{execution.remainingAmount.toFixed(0)}
          </Text>
        </Space>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#999' }}>
        <span>日均: ¥{execution.dailyAverage.toFixed(0)}</span>
        <span>预计: ¥{execution.projectedSpending.toFixed(0)}</span>
        <span>剩余 {execution.daysRemaining} 天</span>
      </div>
    </Card>
  );
};

export default BudgetProgressCard;
