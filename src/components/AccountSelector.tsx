import React from 'react';
import { Select } from 'antd';
import { Account } from '../types';

interface AccountSelectorProps {
  accounts: Account[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
}

const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  value,
  onChange,
  placeholder = '选择账户',
  style,
  disabled = false,
  size = 'middle'
}) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={style}
      disabled={disabled}
      size={size}
      optionLabelProp="label"
    >
      {accounts.map(account => (
        <Select.Option
          key={account.id}
          value={account.id}
          label={
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{account.icon}</span>
              <span>{account.name}</span>
            </span>
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>{account.icon}</span>
              <span style={{ fontWeight: 500 }}>{account.name}</span>
            </span>
            <span style={{ color: account.color, fontWeight: 'bold' }}>
              ¥{account.balance.toFixed(2)}
            </span>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};

export default AccountSelector;
