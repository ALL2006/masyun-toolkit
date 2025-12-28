import React, { useState } from 'react';
import {
  Card,
  Radio,
  Select,
  Button,
  DatePicker,
  Row,
  Col,
  Typography,
  Space,
  message,
  Spin,
  Table,
  Statistic
} from 'antd';
import {
  FileExcelOutlined,
  DownloadOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import Layout from '../components/Layout';
import { reportService } from '../services/reportService';
import { exportService } from '../services/exportService';
import { ReportData, ReportOptions } from '../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ReportExport: React.FC = () => {
  const [reportType, setReportType] = useState<'monthly' | 'yearly' | 'custom'>('monthly');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [customDateRange, setCustomDateRange] = useState<[any, any]>([null, null]);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<ReportData | null>(null);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 生成报表预览
  const handleGeneratePreview = async () => {
    try {
      setLoading(true);

      const options: ReportOptions = {
        type: reportType,
        year: selectedYear,
        month: selectedMonth
      };

      if (reportType === 'custom' && customDateRange[0] && customDateRange[1]) {
        options.startDate = customDateRange[0].format('YYYY-MM-DD');
        options.endDate = customDateRange[1].format('YYYY-MM-DD');
      }

      const data = await reportService.generateReport(options);
      setPreviewData(data);
    } catch (error) {
      message.error('生成报表失败');
    } finally {
      setLoading(false);
    }
  };

  // 导出 Excel
  const handleExportExcel = async () => {
    if (!previewData) {
      message.warning('请先生成报表预览');
      return;
    }

    try {
      await exportService.exportAndDownloadExcel(previewData);
      message.success('报表导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 分类明细表格列
  const categoryColumns = [
    { title: '分类', dataIndex: 'category', key: 'category' },
    {
      title: '收入',
      dataIndex: 'income',
      key: 'income',
      render: (val: number) => `¥${val.toFixed(2)}`
    },
    {
      title: '支出',
      dataIndex: 'expense',
      key: 'expense',
      render: (val: number) => `¥${val.toFixed(2)}`
    },
    { title: '交易次数', dataIndex: 'transactionCount', key: 'transactionCount' },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (val: number) => `${val.toFixed(1)}%`
    }
  ];

  // 每日明细表格列
  const dailyColumns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    {
      title: '收入',
      dataIndex: 'income',
      key: 'income',
      render: (val: number) => `¥${val.toFixed(2)}`
    },
    {
      title: '支出',
      dataIndex: 'expense',
      key: 'expense',
      render: (val: number) => `¥${val.toFixed(2)}`
    },
    {
      title: '净收支',
      dataIndex: 'net',
      key: 'net',
      render: (val: number) => (
        <span style={{ color: val >= 0 ? '#52C41A' : '#FF6B6B', fontWeight: 'bold' }}>
          ¥{val.toFixed(2)}
        </span>
      )
    },
    { title: '交易次数', dataIndex: 'transactionCount', key: 'transactionCount' }
  ];

  return (
    <Layout>
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2} style={{ marginBottom: '24px', color: '#333' }}>
          报表导出
        </Title>

        {/* 报表配置 */}
        <Card
          title="报表配置"
          style={{ marginBottom: '24px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '12px' }}>
                报表类型
              </Text>
              <Radio.Group value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <Radio.Button value="monthly">月度报表</Radio.Button>
                <Radio.Button value="yearly">年度报表</Radio.Button>
                <Radio.Button value="custom">自定义范围</Radio.Button>
              </Radio.Group>
            </div>

            {(reportType === 'monthly' || reportType === 'yearly') && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: '12px' }}>
                  选择{reportType === 'monthly' ? '月份' : '年份'}
                </Text>
                <Space>
                  <Select
                    value={selectedYear}
                    onChange={setSelectedYear}
                    style={{ width: 120 }}
                  >
                    {years.map(year => (
                      <Select.Option key={year} value={year}>
                        {year}年
                      </Select.Option>
                    ))}
                  </Select>
                  {reportType === 'monthly' && (
                    <Select
                      value={selectedMonth}
                      onChange={setSelectedMonth}
                      style={{ width: 100 }}
                    >
                      {months.map(month => (
                        <Select.Option key={month} value={month}>
                          {month}月
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Space>
              </div>
            )}

            {reportType === 'custom' && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: '12px' }}>
                  选择日期范围
                </Text>
                <DatePicker.RangePicker
                  value={customDateRange}
                  onChange={(dates) => setCustomDateRange(dates as [any, any])}
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </div>
            )}

            <Button
              type="primary"
              icon={<BarChartOutlined />}
              onClick={handleGeneratePreview}
              loading={loading}
              size="large"
              style={{ borderRadius: '8px', background: '#4A90E2', borderColor: '#4A90E2' }}
            >
              生成报表预览
            </Button>
          </Space>
        </Card>

        {/* 报表预览 */}
        {previewData && (
          <>
            {/* 操作按钮 */}
            <Card
              style={{ marginBottom: '24px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}
            >
              <Space>
                <Text strong>{previewData.meta.title}</Text>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={handleExportExcel}
                  size="large"
                  style={{ borderRadius: '8px', background: '#52C41A', borderColor: '#52C41A' }}
                >
                  导出 Excel
                </Button>
              </Space>
            </Card>

            {/* 汇总统计 */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
              <Col span={6}>
                <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <Statistic
                    title="总收入"
                    value={previewData.summary.totalIncome}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#52C41A', fontSize: '20px' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <Statistic
                    title="总支出"
                    value={previewData.summary.totalExpense}
                    precision={2}
                    prefix="¥"
                    valueStyle={{ color: '#FF6B6B', fontSize: '20px' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <Statistic
                    title="净收入"
                    value={previewData.summary.netIncome}
                    precision={2}
                    prefix="¥"
                    valueStyle={{
                      color: previewData.summary.netIncome >= 0 ? '#52C41A' : '#FF6B6B',
                      fontSize: '20px'
                    }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                  <Statistic
                    title="交易笔数"
                    value={previewData.summary.transactionCount}
                    valueStyle={{ color: '#4A90E2', fontSize: '20px' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* 分类明细 */}
            <Card
              title="分类明细"
              style={{ marginBottom: '24px', borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}
            >
              <Table
                dataSource={previewData.categoryBreakdown}
                columns={categoryColumns}
                rowKey="category"
                pagination={false}
                size="small"
              />
            </Card>

            {/* 每日明细 */}
            <Card
              title="每日明细"
              style={{ borderRadius: '16px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)' }}
            >
              <Table
                dataSource={previewData.dailyBreakdown}
                columns={dailyColumns}
                rowKey="date"
                pagination={{ pageSize: 10 }}
                size="small"
              />
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ReportExport;
