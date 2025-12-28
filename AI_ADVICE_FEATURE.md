# AI 财务建议功能设计文档

> 基于用户消费数据，提供个性化财务建议和优化方案

---

## 📋 功能概述

### 核心价值
- 帮助用户了解消费习惯
- 提供可行的财务优化建议
- 预警超支风险
- 推荐节省策略

### 用户场景
```
小明打开应用，看到：
"本月你餐饮支出超过预算 200 元，
 建议减少外卖频率，改为自己做饭可以节省约 150 元"
```

---

## 🎯 功能模块设计

### 模块 1：消费分析

**功能**：分析用户消费模式

```
分析维度：
- 按类别统计（餐饮、交通、购物等）
- 按时间统计（工作日 vs 周末）
- 按金额统计（大额支出预警）
- 按频率统计（高频消费提醒）
```

**输出示例**：
```javascript
{
  "totalExpense": 3256.50,
  "categoryBreakdown": {
    "餐饮": { "amount": 1450, "percent": 44.5, "budget": 1200, "over": 250 },
    "交通": { "amount": 320, "percent": 9.8, "budget": 400, "remaining": 80 },
    "购物": { "amount": 890, "percent": 27.3, "budget": 1000, "remaining": 110 }
  },
  "largeTransactions": [
    { "date": "2025-12-25", "amount": 500, "category": "购物", "note": "买衣服" }
  ],
  "frequentMerchants": [
    { "name": "肯德基", "count": 8, "total": 280 }
  ]
}
```

---

### 模块 2：智能建议生成

**规则引擎设计**

#### 规则 1：预算超支提醒
```javascript
if (categoryExpense > budget) {
  return {
    type: "warning",
    title: `${categoryName}支出超支`,
    message: `本月${categoryName}已支出 ${expense} 元，超出预算 ${over} 元`,
    suggestion: getSuggestion(categoryName)
  }
}
```

**建议库**：
```javascript
const suggestions = {
  "餐饮": [
    "外卖平均每单 30 元，每周减少 2 次外卖，月省约 240 元",
    "尝试自己做饭，成本可降低 60%+",
    "工作日自带午餐，月省约 400 元",
    "奶茶减少到每周 1-2 次，月省约 100 元"
  ],
  "交通": [
    "考虑办理月卡，单程票价可节省 20%",
    "短距离可步行或骑车，既健康又省钱",
    "拼车出行可以分摊 50% 费用"
  ],
  "购物": [
    "大额消费前先等 24 小时，避免冲动消费",
    "使用比价工具，找到更优惠的价格",
    "考虑二手平台，部分物品可节省 70%"
  ],
  "娱乐": [
    "选择免费或低价的娱乐方式（公园、图书馆等）",
    "团购电影票可节省 30-50%",
    "减少无效订阅服务，每年可省数百元"
  ]
}
```

#### 规则 2：大额支出预警
```javascript
if (singleTransaction > 500) {
  return {
    type: "info",
    title: "检测到大额支出",
    message: `今日支出 ${amount} 元，是否属于计划内支出？`,
    suggestion: "大额支出建议提前列入预算计划"
  }
}
```

#### 规则 3：高频消费提醒
```javascript
if (merchantCount > 5 && category === "餐饮") {
  return {
    type: "tip",
    title: "消费习惯提醒",
    message: `你本月在 ${merchantName} 消费了 ${count} 次`,
    suggestion: `可以考虑：\n1. 寻找更便宜的替代选项\n2. 控制消费频率\n3. 批量购买享受优惠`
  }
}
```

#### 规则 4：月度总结
```javascript
const monthlySummary = {
  type: "summary",
  title: `${month}月财务总结`,
  highlights: [
    `本月总支出：${total} 元`,
    `${bestCategory}: 最佳控制类别，只花了 ${minAmount} 元`,
    `${worstCategory}: 需要注意，支出占比 ${percent}%`,
    `${improvement}: 相比上月，${category} 支出减少了 ${diff} 元 👍`
  ]
}
```

#### 规则 5：储蓄建议
```javascript
const savingsSuggestions = {
  "52周存钱法": "每周递增存钱，第一周 10 元，第二周 20 元...一年可存 13780 元",
  "365天存钱法": "每天存 1-365 元中任意金额，一年可存 66795 元",
  "10%定投法": "每月收入的 10% 定期存入储蓄账户",
  "零钱存钱法": "将每天找零的钱存起来，一年可存数千元"
}
```

---

### 模块 3：AI/LLM 增强版（可选）

如果接入 LLM，可以实现更智能的建议：

**技术方案**：
```javascript
// 使用 RAG（检索增强生成）
const generateAIAdvice = async (userData) => {
  // 1. 构建上下文
  const context = `
    用户本月消费数据：
    ${JSON.stringify(userData, null, 2)}

    请提供以下建议：
    1. 分析消费结构
    2. 指出可以优化的地方
    3. 给出 3-5 条具体的节省建议
    4. 预测下月支出（基于历史数据）
  `

  // 2. 调用 LLM API
  const response = await fetch('LLM_API_ENDPOINT', {
    method: 'POST',
    body: JSON.stringify({ prompt: context })
  })

  // 3. 返回建议
  return response.json()
}
```

**支持的平台**：
- ✅ **OpenAI ChatGPT**（需要 API Key，需联网）
- ✅ **百度文心一言**（国内稳定）
- ✅ **阿里通义千问**（国内稳定）
- ✅ **本地运行 LLM**（完全离线，如 Ollama + Qwen）

---

## 🎨 UI/UX 设计

### 设计方案 1：首页智能卡片

```
┌─────────────────────────────────────┐
│  💡 智能建议                         │
├─────────────────────────────────────┤
│  餐饮支出超支 250 元 ⚠️             │
│                                     │
│  建议：                             │
│  • 外卖减少 2 次/周，月省 240 元     │
│  • 工作日自带午餐，月省 400 元       │
│                                     │
│  [查看详情] [忽略]                  │
└─────────────────────────────────────┘
```

### 设计方案 2：独立建议页面

```
┌─────────────────────────────────────┐
│  📊 AI 财务分析                      │
├─────────────────────────────────────┤
│  [本月总结] [分类分析] [优化建议]   │
│                                     │
│  📈 本月支出趋势                     │
│  [图表显示]                         │
│                                     │
│  💡 为您生成 3 条建议：              │
│  1. [建议卡片 1]                    │
│  2. [建议卡片 2]                    │
│  3. [建议卡片 3]                    │
│                                     │
│  [重新分析] [导出报告]             │
└─────────────────────────────────────┘
```

### 设计方案 3：对话式助手

```
┌─────────────────────────────────────┐
│  🤖 财务助手                         │
├─────────────────────────────────────┤
│  你：这个月我花了多少钱？            │
│  助手：本月总支出 3,256 元           │
│                                     │
│  你：吃得太多了吧？                  │
│  助手：是的，餐饮占比 44.5%，建议... │
│                                     │
│  [输入问题...]                      │
└─────────────────────────────────────┘
```

---

## 💻 技术实现

### 步骤 1：创建建议服务

```typescript
// src/services/adviceService.ts

interface ConsumptionData {
  totalExpense: number;
  categoryBreakdown: Record<string, {
    amount: number;
    percent: number;
    budget?: number;
    over?: number;
    remaining?: number;
  }>;
  largeTransactions: Transaction[];
  frequentMerchants: Array<{ name: string; count: number; total: number }>;
}

interface Advice {
  type: 'warning' | 'info' | 'tip' | 'summary';
  title: string;
  message: string;
  suggestion: string | string[];
  priority?: number;
}

class AdviceService {
  // 规则库
  private rules = {
    budgetOverLimit: (data: ConsumptionData): Advice | null => {
      const overBudget = Object.entries(data.categoryBreakdown)
        .filter(([_, cat]) => cat.over && cat.over > 0)
        .map(([category, cat]) => ({ category, over: cat.over, amount: cat.amount }));

      if (overBudget.length === 0) return null;

      const { category, over, amount } = overBudget[0];
      return {
        type: 'warning',
        title: `${category}支出超支`,
        message: `本月${category}已支出 ${amount} 元，超出预算 ${over} 元`,
        suggestion: this.getSuggestion(category),
        priority: 1
      };
    },

    largeTransaction: (data: ConsumptionData): Advice | null => {
      if (data.largeTransactions.length === 0) return null;

      const tx = data.largeTransactions[0];
      return {
        type: 'info',
        title: '检测到大额支出',
        message: `${tx.date} 支出 ${tx.amount} 元（${tx.note || tx.category}）`,
        suggestion: '大额支出建议提前列入预算计划，避免影响其他支出',
        priority: 2
      };
    },

    frequentSpending: (data: ConsumptionData): Advice | null => {
      const frequent = data.frequentMerchants.filter(m => m.count > 5);
      if (frequent.length === 0) return null;

      const { name, count, total } = frequent[0];
      return {
        type: 'tip',
        title: '消费习惯提醒',
        message: `你本月在「${name}」消费了 ${count} 次，总计 ${total} 元`,
        suggestion: `可以考虑：\n1. 寻找更便宜的替代选项\n2. 控制消费频率\n3. 批量购买享受优惠`,
        priority: 3
      };
    }
  };

  // 建议库
  private suggestions = {
    "餐饮": [
      "外卖平均每单 30 元，每周减少 2 次外卖，月省约 240 元",
      "尝试自己做饭，成本可降低 60%+",
      "工作日自带午餐，月省约 400 元",
      "奶茶减少到每周 1-2 次，月省约 100 元"
    ],
    "交通": [
      "考虑办理月卡，单程票价可节省 20%",
      "短距离可步行或骑车，既健康又省钱",
      "拼车出行可以分摊 50% 费用"
    ],
    "购物": [
      "大额消费前先等 24 小时，避免冲动消费",
      "使用比价工具，找到更优惠的价格",
      "考虑二手平台，部分物品可节省 70%"
    ],
    "娱乐": [
      "选择免费或低价的娱乐方式（公园、图书馆等）",
      "团购电影票可节省 30-50%",
      "减少无效订阅服务，每年可省数百元"
    ]
  };

  private getSuggestion(category: string): string {
    const categorySuggestions = this.suggestions[category] || [];
    return categorySuggestions[Math.floor(Math.random() * categorySuggestions.length)];
  }

  // 分析数据并生成建议
  async analyzeAndAdvise(transactions: Transaction[]): Promise<Advice[]> {
    const data = this.analyzeConsumption(transactions);
    const advices: Advice[] = [];

    // 运行所有规则
    for (const rule of Object.values(this.rules)) {
      const advice = rule(data);
      if (advice) advices.push(advice);
    }

    // 按优先级排序
    return advices.sort((a, b) => (a.priority || 99) - (b.priority || 99));
  }

  private analyzeConsumption(transactions: Transaction[]): ConsumptionData {
    // 实现消费数据分析逻辑
    // ...
    return {} as ConsumptionData;
  }
}

export default new AdviceService();
```

### 步骤 2：创建建议组件

```tsx
// src/components/FinancialAdvice.tsx

import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, Typography, Space } from 'antd';
import { BulbOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface AdviceProps {
  transactions: Transaction[];
}

const FinancialAdvice: React.FC<AdviceProps> = ({ transactions }) => {
  const [advices, setAdvices] = useState<Advice[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    adviceService.analyzeAndAdvise(transactions).then(setAdvices);
  }, [transactions]);

  const dismiss = (index: number) => {
    setDismissed(new Set([...dismissed, index]));
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {advices.map((advice, index) => {
        if (dismissed.has(index)) return null;

        return (
          <Card
            key={index}
            style={{
              borderLeft: `4px solid ${
                advice.type === 'warning' ? '#ff4d4f' :
                advice.type === 'info' ? '#1890ff' :
                '#52c41a'
              }`
            }}
            extra={
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => dismiss(index)}
              />
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={5} style={{ margin: 0 }}>
                <BulbOutlined /> {advice.title}
              </Title>
              <Text>{advice.message}</Text>
              <Paragraph style={{
                background: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
                margin: 0
              }}>
                💡 {advice.suggestion}
              </Paragraph>
            </Space>
          </Card>
        );
      })}
    </Space>
  );
};

export default FinancialAdvice;
```

### 步骤 3：集成到首页

```tsx
// src/pages/Home.tsx

import FinancialAdvice from '../components/FinancialAdvice';

// 在已有的组件中添加
<FinancialAdvice transactions={transactions} />
```

---

## 🚀 开发计划

### 阶段 1：基础规则引擎（推荐先做）
- [ ] 实现消费数据分析
- [ ] 创建建议规则库
- [ ] 实现 UI 组件
- [ ] 集成到首页

**预计工作量**：4-6 小时
**技术难度**：⭐⭐

### 阶段 2：AI 增强版
- [ ] 接入 LLM API（ChatGPT/文心一言）
- [ ] 实现对话式助手
- [ ] 优化建议质量

**预计工作量**：8-12 小时
**技术难度**：⭐⭐⭐⭐

---

## 💡 特色功能建议

### 1. 建议可执行度评分
```
建议："减少外卖频率"
可执行度：★★★★☆

建议："每个月存 50% 收入"
可执行度：★☆☆☆☆（太难了！）
```

### 2. 建议接受度追踪
```
用户点击"采纳建议"后，系统记录
并在下月反馈：
"你采纳了'自带午餐'建议，
 实际节省了 380 元！🎉"
```

### 3. 个性化推荐
```
根据用户历史数据调整建议：
- 如果用户经常点奶茶 → 建议减少奶茶频率
- 如果用户交通费高 → 推荐月卡
- 如果用户购物多 → 推荐比价工具
```

---

## 📊 效果展示

### 效果 1：预算控制
```
用户反馈：
"用了 3 个月，餐饮支出从 1500 降到 1100，
 每月节省 400 元！"
```

### 效果 2：习惯养成
```
用户反馈：
"现在花钱前会想想是否必要，
 冲动消费减少了很多"
```

---

需要我帮你实现这个功能吗？
我可以：
1. 创建完整的 adviceService.ts 服务
2. 实现 FinancialAdvice 组件
3. 集成到现有页面
4. 添加漂亮的 UI 设计

**预计 2-3 小时即可完成基础版本！**
