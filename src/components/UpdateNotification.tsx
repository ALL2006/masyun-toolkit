import React, { useEffect, useState } from 'react';
import { App, Progress } from 'antd';
import { DownloadOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface UpdateMessage {
  type: 'error' | 'available' | 'not-available' | 'downloading' | 'downloaded';
  version?: string;
  percent?: number;
  message: string;
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

        if (msg.type === 'available') {
          // 发现新版本，显示通知
          (notification.info as any)({
            message: '发现新版本',
            description: `版本 ${msg.version} 已发布，正在自动下载...`,
            icon: <DownloadOutlined style={{ color: '#1890ff' }} />,
            duration: 0
          });

          setDownloadingPercent(0);
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
        } else if (msg.type === 'error') {
          // 更新错误
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
