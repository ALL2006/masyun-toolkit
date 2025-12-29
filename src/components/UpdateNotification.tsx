import React, { useEffect, useState } from 'react';
import { App, Progress, Button } from 'antd';
import { DownloadOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

interface UpdateMessage {
  type: 'error' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'manual-download' | 'checking';
  version?: string;
  percent?: number;
  message: string;
  downloadUrl?: string;
}

const UpdateNotification: React.FC = () => {
  const [downloadingPercent, setDownloadingPercent] = useState(0);
  const { notification } = App.useApp();

  useEffect(() => {
    // 仅在 Electron 环境中监听
    if (window.require) {
      const { ipcRenderer } = window.require('electron');

      // 监听更新消息
      const handleUpdateMessage = (_event: any, msg: UpdateMessage) => {
        console.log('收到更新消息:', msg);

        if (msg.type === 'checking') {
          // 正在检查更新
          (notification.open as any)({
    key: 'update-checking',
    message: '检查更新中',
    description: msg.message,
    icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
    duration: 0
  });
        } else if (msg.type === 'available') {
          // 发现新版本，显示通知（自动更新模式）
          notification.destroy('update-checking');
          (notification.info as any)({
            message: '发现新版本',
            description: `版本 ${msg.version} 已发布，正在自动下载...`,
            icon: <DownloadOutlined style={{ color: '#1890ff' }} />,
            duration: 0
          });

          setDownloadingPercent(0);
        } else if (msg.type === 'manual-download') {
          // 手动下载模式
          notification.destroy('update-checking');
          (notification.warning as any)({
            message: '发现新版本',
            description: (
              <div>
                <div>版本 {msg.version} 已发布</div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  检测到无法访问 GitHub，请前往官网手动下载
                </div>
              </div>
            ),
            icon: <InfoCircleOutlined style={{ color: '#faad14' }} />,
            duration: 0,
            btn: () => (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  if (msg.downloadUrl && window.open) {
                    window.open(msg.downloadUrl, '_blank');
                  }
                  notification.destroy();
                }}
              >
                前往下载
              </Button>
            )
          });
        } else if (msg.type === 'downloading') {
          // 更新下载进度
          setDownloadingPercent(msg.percent || 0);

          // 更新或创建下载进度通知
          (notification.open as any)({
            type: 'info',
            message: '正在下载更新',
            description: (
              <div style={{ minWidth: 200 }}>
                <Progress percent={msg.percent} size="small" status="active" />
              </div>
            ),
            duration: 0,
            key: 'update-downloading'
          });
        } else if (msg.type === 'downloaded') {
          // 下载完成
          notification.destroy('update-downloading');
          (notification.success as any)({
            message: '更新已就绪',
            description: '点击查看详情',
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            duration: 0
          });
        } else if (msg.type === 'not-available') {
          // 当前已是最新版本
          notification.destroy('update-checking');
          (notification.success as any)({
            message: '已是最新版本',
            description: msg.message,
            duration: 3
          });
        } else if (msg.type === 'error') {
          // 更新错误
          notification.destroy('update-checking');
          (notification.error as any)({
            message: '更新失败',
            description: msg.message,
            duration: 5
          });
        }
      };

      ipcRenderer.on('update-message', handleUpdateMessage);

      // 清理函数
      return () => {
        ipcRenderer.removeListener('update-message', handleUpdateMessage);
      };
    }
  }, [notification]);

  // 这个组件只负责监听和显示通知，不渲染任何 UI
  return null;
};

export default UpdateNotification;
