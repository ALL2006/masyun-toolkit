import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Transaction } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: Transaction[];
  title?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title = '收支趋势' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        height: '300px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#999',
        fontSize: '16px'
      }}>
        暂无数据
      </div>
    );
  }

  // 按日期分组数据
  const groupedData = data.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) {
      acc[date] = { income: 0, expense: 0 };
    }
    if (transaction.type === 'income') {
      acc[date].income += transaction.amount;
    } else {
      acc[date].expense += transaction.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  const sortedDates = Object.keys(groupedData).sort();
  const incomeData = sortedDates.map(date => groupedData[date].income);
  const expenseData = sortedDates.map(date => groupedData[date].expense);

  const chartData = {
    labels: sortedDates.map(date => new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: '收入',
        data: incomeData,
        backgroundColor: '#52C41A',
        borderColor: '#52C41A',
        borderWidth: 1
      },
      {
        label: '支出',
        data: expenseData,
        backgroundColor: '#FF6B6B',
        borderColor: '#FF6B6B',
        borderWidth: 1
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ¥${context.parsed?.y?.toFixed(2) || '0.00'}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '¥' + value;
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45
        }
      }
    }
  };

  return (
    <div style={{ height: '400px', padding: '20px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;