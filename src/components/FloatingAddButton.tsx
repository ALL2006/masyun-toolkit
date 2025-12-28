import React from 'react';
import { FloatButton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

/**
 * 全局浮动记账按钮
 * 在所有页面右下角显示，点击跳转到添加交易页面
 */
const FloatingAddButton: React.FC = () => {
  const handleClick = () => {
    // 使用 window.location.hash 而不是 useNavigate
    // 因为这个组件在 Router 外部
    window.location.hash = '#/add';
  };

  return (
    <FloatButton
      icon={<PlusOutlined />}
      type="primary"
      onClick={handleClick}
      style={{ right: 24, bottom: 24 }}
      tooltip="快速记账"
    />
  );
};

export default FloatingAddButton;
