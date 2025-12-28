/**
 * AI 财务分析页面
 */
import React, { useEffect, useState } from 'react';
import {
  Card,
  Radio,
  Button,
  Spin,
  Typography,
  Space,
  Alert,
  Divider,
  Tag,
  Statistic,
  Row,
  Col,
  message
} from 'antd';
import {
  BulbOutlined,
  ReloadOutlined,
  CloseOutlined,
  DollarOutlined,
  PieChartOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import Layout from '../components/Layout';
import { transactionService } from '../services/transactionService';
import { performFullAnalysis } from '../services/aiAnalysisService';
import { AnalysisRange, RANGE_CONFIG } from '../config/aiConfig';
import type { Transaction } from '../types';
import type { AIAnalysisData, AIAnalysisResult } from '../types';

const { Title, Text, Paragraph } = Typography;

const AIAnalysis: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [range, setRange] = useState<AnalysisRange>('month');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AIAnalysisData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 加载交易数据
  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getAllTransactions();
      setTransactions(data);
    } catch (err) {
      message.error('加载数据失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 执行分析
  const handleAnalysis = async () => {
    setError(null);
    setAnalysisData(null);
    setAnalysisResult(null);

    try {
      setAnalyzing(true);
      const result = await performFullAnalysis(transactions, range);
      setAnalysisData(result.data);
      setAnalysisResult(result.result);
    } catch (err: any) {
      const errorMsg = err?.message || '分析失败，请稍后重试';
      setError(errorMsg);
      message.error(errorMsg);
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // 重置分析
  const handleReset = () => {
    setAnalysisData(null);
    setAnalysisResult(null);
    setError(null);
  };

  // 加载状态
  if (loading) {
    return (
      <Layout>
        <div style={{ padding: '24px', textAlign: 'center', marginTop: '100px' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>加载数据中...</p>
        </div>
      </Layout>
    );
  }

  // 初始状态 - 选择范围
  if (!analysisData && !analyzing) {
    return (
      <Layout>
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
            <BulbOutlined style={{ marginRight: '8px', color: '#4A90E2' }} />
            AI 财务分析
          </Title>

          <Card style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>
                  <PieChartOutlined style={{ marginRight: '8px' }} />
                  选择分析范围
                </Title>
                <Radio.Group
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  {Object.entries(RANGE_CONFIG).map(([key, config]) => (
                    <Radio.Button
                      key={key}
                      value={key}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        height: 'auto',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: range === key ? '2px solid #4A90E2' : '1px solid #d9d9d9'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{config.label}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{config.description}</div>
                      </div>
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>

              <Divider style={{ margin: '16px 0' }} />

              <div>
                <Title level={4}>
                  <ThunderboltOutlined style={{ marginRight: '8px' }} />
                  说明
                </Title>
                <ul style={{ paddingLeft: '20px', color: '#666' }}>
                  <li>本月：分析当前月份的消费</li>
                  <li>本季度：分析最近3个月的消费</li>
                  <li>数据越多，分析越准确</li>
                  <li>AI 基于您的消费习惯给出个性化建议</li>
                </ul>
              </div>

              <Button
                type="primary"
                size="large"
                icon={<BulbOutlined />}
                onClick={handleAnalysis}
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '16px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #4A90E2 0%, #52C41A 100%)',
                  border: 'none'
                }}
              >
                开始分析
              </Button>
            </Space>
          </Card>
        </div>
      </Layout>
    );
  }

  // 分析中状态
  if (analyzing) {
    return (
      <Layout>
        <div style={{ padding: '24px', textAlign: 'center', marginTop: '100px' }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: '24px' }}>
            AI 正在分析您的消费数据...
          </Title>
          <Text type="secondary">这可能需要几秒钟，请稍候</Text>
        </div>
      </Layout>
    );
  }

  // 分析结果状态
  return (
    <Layout>
      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0 }}>
            <BulbOutlined style={{ marginRight: '8px', color: '#4A90E2' }} />
            AI 财务分析
          </Title>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重新分析
            </Button>
          </Space>
        </div>

        {error && (
          <Alert
            message="分析失败"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        {/* 统计摘要 */}
        {analysisData && (
          <Card
            title={
              <span>
                <PieChartOutlined style={{ marginRight: '8px' }} />
                消费结构分析 · {analysisData.period}
              </span>
            }
            style={{ marginBottom: '24px', borderRadius: '16px' }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="总支出"
                  value={analysisData.totalExpense}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix="元"
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="总收入"
                  value={analysisData.totalIncome}
                  precision={2}
                  prefix={<DollarOutlined />}
                  suffix="元"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="交易笔数"
                  value={analysisData.transactionCount}
                  suffix="笔"
                />
              </Col>
            </Row>

            <Divider />

            <Title level={5}>分类统计</Title>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {Object.entries(analysisData.categoryBreakdown)
                .sort(([, a], [, b]) => b.amount - a.amount)
                .map(([category, info]) => (
                  <Tag
                    key={category}
                    color="blue"
                    style={{
                      padding: '8px 16px',
                      fontSize: '14px',
                      borderRadius: '8px'
                    }}
                  >
                    {category}：{info.amount.toFixed(2)} 元（{info.percent.toFixed(1)}%）
                  </Tag>
                ))}
            </div>

            {analysisData.largeTransactions.length > 0 && (
              <>
                <Divider />
                <Title level={5}>大额支出（单笔超过500元）</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {analysisData.largeTransactions.map((t, index) => (
                    <div key={index} style={{ padding: '8px', background: '#f5f5f5', borderRadius: '8px' }}>
                      <Text strong>{t.date}</Text>
                      <Tag color="red" style={{ marginLeft: '8px' }}>
                        {t.category}
                      </Tag>
                      <Text style={{ float: 'right', color: '#ff4d4f', fontWeight: 'bold' }}>
                        ¥{t.amount.toFixed(2)}
                      </Text>
                      <div style={{ marginTop: '4px', color: '#666', fontSize: '12px' }}>
                        {t.note}
                      </div>
                    </div>
                  ))}
                </Space>
              </>
            )}
          </Card>
        )}

        {/* AI 分析结果 */}
        {analysisResult && (
          <>
            {/* 消费亮点 */}
            <Card
              title={
                <span>
                  <BulbOutlined style={{ marginRight: '8px', color: '#52C41A' }} />
                  消费亮点
                </span>
              }
              style={{ marginBottom: '24px', borderRadius: '16px', background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)' }}
            >
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', margin: 0 }}>
                {analysisResult.summary}
              </Paragraph>
            </Card>

            {/* 需要关注 */}
            {analysisResult.insights.length > 0 && (
              <Card
                title={
                  <span>
                    <ThunderboltOutlined style={{ marginRight: '8px', color: '#FAAD14' }} />
                    需要关注
                  </span>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {analysisResult.insights.map((insight, index) => (
                    <Alert
                      key={index}
                      message={`关注 ${index + 1}`}
                      description={insight}
                      type="warning"
                      showIcon
                      style={{ borderRadius: '8px' }}
                    />
                  ))}
                </Space>
              </Card>
            )}

            {/* 行动建议 */}
            {analysisResult.suggestions.length > 0 && (
              <Card
                title={
                  <span>
                    <DollarOutlined style={{ marginRight: '8px', color: '#1890FF' }} />
                    行动建议
                  </span>
                }
                style={{ marginBottom: '24px', borderRadius: '16px' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '16px',
                        background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                        borderRadius: '12px',
                        borderLeft: '4px solid #52C41A'
                      }}
                    >
                      <Space>
                        <Tag color="green" style={{ fontSize: '16px', padding: '4px 12px' }}>
                          {index + 1}
                        </Tag>
                        <Text style={{ fontSize: '15px' }}>{suggestion}</Text>
                      </Space>
                    </div>
                  ))}
                </Space>
              </Card>
            )}
          </>
        )}

        {/* 底部操作 */}
        <Card style={{ textAlign: 'center', borderRadius: '16px', background: '#f5f5f5' }}>
          <Space>
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleReset}
              size="large"
            >
              重新分析
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={() => window.history.back()}
              size="large"
            >
              关闭
            </Button>
          </Space>
        </Card>
      </div>
    </Layout>
  );
};

export default AIAnalysis;
