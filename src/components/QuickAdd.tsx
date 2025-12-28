import React from 'react';
import { Button, Row, Col, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Category } from '../types';

const { Title } = Typography;

interface QuickAddProps {
  categories: Category[];
}

const QuickAdd: React.FC<QuickAddProps> = ({ categories }) => {
  const navigate = useNavigate();

  const handleQuickAdd = (category: Category) => {
    navigate('/add', { state: { category } });
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  return (
    <div style={{ marginBottom: '24px' }}>
      <Title level={4} style={{ marginBottom: '16px', color: '#333' }}>
        快速记账
      </Title>
      <Row gutter={[12, 12]}>
        {expenseCategories.slice(0, 6).map((category) => (
          <Col key={category.id} span={8}>
            <Button
              type="default"
              size="large"
              block
              onClick={() => handleQuickAdd(category)}
              style={{
                height: '60px',
                borderRadius: '12px',
                backgroundColor: category.color + '20',
                borderColor: category.color,
                color: category.color,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              <span style={{ fontSize: '20px' }}>{category.icon}</span>
              <span>{category.name}</span>
            </Button>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default QuickAdd;