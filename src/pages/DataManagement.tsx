import React, { useState } from 'react';
import { Card, Button, Upload, Typography, Space, Modal, message, Divider } from 'antd';
import { UploadOutlined, DownloadOutlined, DeleteOutlined, QuestionCircleOutlined, ReloadOutlined, FolderOpenOutlined } from '@ant-design/icons';
import Layout from '../components/Layout';
import { transactionService } from '../services/transactionService';
import { categoryService } from '../services/categoryService';
import { Filesystem, Directory } from '@capacitor/filesystem';

const { Title, Text, Paragraph } = Typography;

const DataManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportedFileUri, setExportedFileUri] = useState<string | null>(null);

  // 检查是否在移动端
  const isCapacitor = () => !!(window as any).Capacitor;

  // 导出数据
  const handleExport = async () => {
    try {
      setLoading(true);
      const jsonData = await transactionService.exportData();
      const filename = `记账数据_${new Date().toISOString().split('T')[0]}.json`;

      if (isCapacitor()) {
        // 移动端：保存到 Documents 目录
        const dirPath = '大学生记账本';
        try {
          await Filesystem.mkdir({
            path: dirPath,
            directory: Directory.Documents,
            recursive: false
          });
        } catch (e) {
          // 目录可能已存在，忽略错误
        }

        const filePath = `${dirPath}/${filename}`;
        await Filesystem.writeFile({
          path: filePath,
          data: jsonData,
          directory: Directory.Documents,
          recursive: true
        });

        // 获取文件 URI
        const uriResult = await Filesystem.getUri({
          path: filePath,
          directory: Directory.Documents
        });

        setExportedFileUri(uriResult.uri);
        message.success({
          content: '数据导出成功！文件已保存到：Documents/大学生记账本/',
          duration: 5,
        });
      } else {
        // 桌面端：使用浏览器下载
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        message.success('数据导出成功！');
      }
    } catch (error) {
      message.error('数据导出失败');
      console.error('导出失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 查看导出的文件
  const handleViewFile = () => {
    if (exportedFileUri) {
      window.open(exportedFileUri, '_blank');
    }
  };

  // 导入数据
  const handleImport = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          await transactionService.importData(content);
          message.success('数据导入成功！');
        } catch (error) {
          message.error('数据导入失败，请检查文件格式');
          console.error('导入失败:', error);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      message.error('文件读取失败');
    }
    return false; // 阻止自动上传
  };

  // 清空数据
  const handleClearData = () => {
    Modal.confirm({
      title: '确认清空数据',
      content: '此操作将删除所有记账记录，但会保留分类设置。是否继续？',
      okText: '确认',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await transactionService.clearAllData();
          message.success('数据已清空');
        } catch (error) {
          message.error('清空数据失败');
        }
      }
    });
  };

  // 重置分类
  const handleResetCategories = () => {
    Modal.confirm({
      title: '确认重置分类',
      content: '此操作将重置分类为默认设置，是否继续？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await categoryService.resetToDefault();
          message.success('分类已重置为默认值');
        } catch (error) {
          message.error('重置分类失败');
        }
      }
    });
  };

  const uploadProps = {
    beforeUpload: handleImport,
    accept: '.json',
    showUploadList: false
  };

  return (
    <Layout>
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '32px', color: '#333' }}>
          数据管理
        </Title>

        {/* 数据导入导出 */}
        <Card 
          title="数据备份与恢复" 
          style={{ 
            marginBottom: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                导出数据
              </Text>
              <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
                将您的所有记账记录导出为 JSON 文件，可用于备份或迁移数据
              </Paragraph>
              <Space>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  loading={loading}
                  size="large"
                  style={{
                    background: '#4A90E2',
                    borderColor: '#4A90E2',
                    borderRadius: '8px'
                  }}
                >
                  导出数据
                </Button>
                {exportedFileUri && (
                  <Button
                    icon={<FolderOpenOutlined />}
                    onClick={handleViewFile}
                    size="large"
                    style={{
                      borderRadius: '8px'
                    }}
                  >
                    查看文件
                  </Button>
                )}
              </Space>
            </div>

            <Divider />

            <div>
              <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                导入数据
              </Text>
              <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
                从 JSON 文件导入记账记录，导入前请确保文件格式正确
              </Paragraph>
              <Upload {...uploadProps}>
                <Button
                  icon={<UploadOutlined />}
                  size="large"
                  style={{
                    borderRadius: '8px'
                  }}
                >
                  选择文件导入
                </Button>
              </Upload>
            </div>
          </Space>
        </Card>

        {/* 数据管理 */}
        <Card 
          title="数据管理" 
          style={{ 
            marginBottom: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                清空记账数据
              </Text>
              <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
                删除所有记账记录，但保留分类设置。此操作不可恢复
              </Paragraph>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleClearData}
                size="large"
                style={{
                  borderRadius: '8px'
                }}
              >
                清空数据
              </Button>
            </div>

            <Divider />

            <div>
              <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                重置分类
              </Text>
              <Paragraph type="secondary" style={{ marginBottom: '16px' }}>
                将分类重置为默认设置，此操作会删除所有自定义分类
              </Paragraph>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleResetCategories}
                size="large"
                style={{
                  borderRadius: '8px'
                }}
              >
                重置分类
              </Button>
            </div>
          </Space>
        </Card>

        {/* 使用说明 */}
        <Card 
          title="使用说明" 
          style={{ 
            borderRadius: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                <QuestionCircleOutlined style={{ marginRight: '8px', color: '#4A90E2' }} />
                快速开始
              </Text>
              <Paragraph>
                1. <strong>添加记录：</strong>点击顶部"记账"按钮，选择类型（收入/支出），输入金额和分类，保存即可
              </Paragraph>
              <Paragraph>
                2. <strong>快速记账：</strong>在首页点击常用分类按钮，快速添加支出记录
              </Paragraph>
              <Paragraph>
                3. <strong>查看统计：</strong>进入"统计"页面，可查看日/周/月视图的收入支出分析
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                数据安全
              </Text>
              <Paragraph>
                • 所有数据都保存在您的电脑本地，不会上传到任何服务器
              </Paragraph>
              <Paragraph>
                • 建议定期导出数据备份，防止意外丢失
              </Paragraph>
              <Paragraph>
                • 支持导入导出功能，方便在不同设备间迁移数据
              </Paragraph>
            </div>

            <Divider />

            <div>
              <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                分类管理
              </Text>
              <Paragraph>
                • 系统预设了常用的收入和支出分类
              </Paragraph>
              <Paragraph>
                • 您可以根据需要重置分类为默认值
              </Paragraph>
              <Paragraph>
                • 每个分类都有对应的颜色和图标，方便识别
              </Paragraph>
            </div>
          </Space>
        </Card>
      </div>
    </Layout>
  );
};

export default DataManagement;