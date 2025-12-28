# AI 财务分析功能开发任务文档

> 本文档包含完整的开发需求，供 AI 执行使用

---

## 📋 需求概述

### 功能描述
在记账应用中添加 AI 财务分析功能，用户点击后可选择分析范围，AI 基于消费数据给出个性化建议。

### 技术方案
- **数据预处理**：本地统计和聚合交易数据
- **AI 调用**：使用用户提供的 API Key
- **API 保护**：Base64 编码 + 环境混淆（最简单方案）

---

## 🎯 核心需求

### 1. 新增独立页面

**路由**: `/ai-analysis`

**导航栏位置**：与首页、账户、预算、统计、报表、数据管理同级

**路径**: `src/pages/AIAnalysis.tsx`

### 2. 页面 UI 设计

#### 2.1 初始状态

```
┌─────────────────────────────────────┐
│  🤖 AI 财务分析                      │
├─────────────────────────────────────┤
│                                     │
│  📊 选择分析范围                  │
│  ┌─────────────────────────────┐   │
│  │ ● 本月                       │   │
│  │ ○ 本季度                     │   │
│  │ ○ 近半年                     │   │
│  │ ○ 全部数据                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  💡 说明                          │
│  • 本月：分析当前月份的消费       │
│  • 本季度：分析最近3个月         │
│  • 数据越多，分析越准确           │
│                                     │
│  [开始分析]                        │
└─────────────────────────────────────┘
```

#### 2.2 加载状态

```
┌─────────────────────────────────────┐
│  🤖 AI 财务分析                      │
├─────────────────────────────────────┤
│                                     │
│         ⏳                      │
│                                     │
│      AI 正在分析您的消费数据...     │
│                                     │
│     [Loading...]                    │
└─────────────────────────────────────┘
```

#### 2.3 分析结果

```
┌─────────────────────────────────────┐
│  🤖 AI 财务分析                      │
├─────────────────────────────────────┤
│                                     │
│  📊 消费结构分析                    │
│  ┌─────────────────────────────┐   │
│  │ 本月总支出：3,256 元          │   │
│  │ 餐饮：44.5% (1,450 元)        │   │
│  │ 交通：9.8% (320 元)           │   │
│  │ 购物：27.3% (890 元)          │   │
│  │ 其他：18.4% (596 元)          │   │
│  └─────────────────────────────┘   │
│                                     │
│  💡 优化建议                        │
│  ┌─────────────────────────────┐   │
│  │ 1. 餐饮支出占比较高          │   │
│  │     外卖平均每单 30 元，     │   │
│  │     建议：每周减少 2 次外卖，│   │
│  │     月可节省约 240 元       │   │
│  │                             │   │
│  │ 2. 交通支出控制良好          │   │
│  │     本月交通预算剩余 80 元   │   │
│  │     继续保持！             │   │
│  │                             │   │
│  │ 3. 大额支出提醒              │   │
│  │     本月有一笔 500 元购物   │   │
│ │     建议大额消费前列入预算   │   │
│  └─────────────────────────────┘   │
│                                     │
│  💰 预测节省                        │
│  ┌─────────────────────────────┐   │
│  │ 如采纳以上优化建议，         │   │
│  │ 下月预计可节省：约 240 元    │   │
│  └─────────────────────────────┘   │
│                                     │
│  [🔄 重新分析]  [✖ 关闭]           │
└─────────────────────────────────────┘
```

---

## 🔧 技术实现细节

### 1. API Key 保护方案

**存储位置**: 代码中（使用混淆和编码）

**实现方式**:
```typescript
// src/config/aiConfig.ts

// API Key 拆分 + Base64 编码
const API_KEY_PART1 = "c2stc19z"; // 前半段（Base64编码）
const API_KEY_PART2 = "aG9w......";  // 后半段（Base64编码）

export function getApiKey(): string {
  // 运行时拼接并解码
  return atob(API_KEY_PART1) + atob(API_KEY_PART2);
}

// API 配置
export const AI_CONFIG = {
  baseURL: "https://api.openai.com/v1", // 或其他 API
  model: "gpt-4", // 或其他模型
};
```

### 2. 数据预处理逻辑

**输入**: 用户选择的交易记录

**处理步骤**:
1. 根据选择范围过滤数据（本月/本季度/近半年/全部）
2. 按类别分组统计
3. 计算总支出和占比
4. 识别大额交易（单笔 > 500 元）
5. 生成统计摘要

**输出格式**:
```json
{
  "period": "本月",
  "totalExpense": 3256.50,
  "transactionCount": 45,
  "categoryBreakdown": {
    "餐饮": { "amount": 1450, "percent": 44.5, "count": 18 },
    "交通": { "amount": 320, "percent": 9.8, "count": 20 },
    "购物": { "amount": 890, "percent": 27.3, "count": 5 },
    "娱乐": { "amount": 350, "percent": 10.7, "count": 3 },
    "其他": { "amount": 246.5, "percent": 7.6, "count": 2 }
  },
  "largeTransactions": [
    { "date": "2025-12-25", "amount": 500, "category": "购物", "note": "买衣服" }
  ],
  "averagePerTransaction": 72.36
}
```

### 3. AI Prompt 模板

**硬编码在代码中**:

```typescript
const ANALYSIS_PROMPT = (data: any): string => {
  return `你是一个专业的财务顾问，请分析以下消费数据：

【分析期间】${data.period}
【总支出】${data.totalExpense} 元
【交易笔数】${data.transactionCount} 笔

【分类统计】
${Object.entries(data.categoryBreakdown).map(([cat, info]) =>
  `- ${cat}：${info.amount} 元（${info.percent}%），${info.count} 笔`
).join('\n')}

【大额支出】
${data.largeTransactions.map(t =>
  `- ${t.date} ${t.category} ${t.amount} 元（${t.note || '无备注'}）`
).join('\n')}

【平均每笔】${data.averagePerTransaction.toFixed(2)} 元

请提供：
1. 消费结构分析（2-3句话）
2. 指出可以优化的地方（1-2条）
3. 具体的节省建议（3-5条，每条20-30字）

要求：
- 语气友好，像朋友聊天
- 建议要具体可行，不要空洞
- 考虑到大学生/年轻人的实际情况
- 每条建议独立成段，用换行分隔`;
};
```

### 4. API 调用逻辑

```typescript
// src/services/aiAnalysisService.ts

export async function analyzeWithAI(data: any): Promise<string> {
  const apiKey = getApiKey();
  const prompt = ANALYSIS_PROMPT(data);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: "你是一个专业的财务顾问。" },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })
  });

  const result = await response.json();
  return result.choices[0].message.content;
}
```

---

## 📁 文件结构

### 新增文件

```
src/
├── config/
│   └── aiConfig.ts              # AI 配置和 API Key 管理
├── pages/
│   └── AIAnalysis.tsx            # AI 分析页面
├── services/
│   └── aiAnalysisService.ts     # AI API 调用服务
└── types/
    └── ai.ts                     # AI 相关类型定义
```

### 修改文件

```
src/
├── App.tsx                        # 添加 AI 分析路由
└── components/
    └── Layout.tsx                 # 添加导航项
```

---

## 🎨 UI 规范

### 设计要求
- 使用 Ant Design 组件保持风格统一
- 配色方案与现有页面一致
- 响应式设计，支持不同屏幕尺寸
- 加载状态使用 Ant Design 的 Spin 组件

### 组件使用

```tsx
// 数据范围选择
<Radio.Group value={range} onChange={(e) => setRange(e.target.value)}>
  <Radio.Button value="month">本月</Radio.Button>
  <Radio.Button value="quarter">本季度</Radio.Button>
  <Radio.Button value="halfYear">近半年</Radio.Button>
  <Radio.Button value="all">全部数据</Radio.Button>
</Radio.Group>

// 分析按钮
<Button
  type="primary"
  size="large"
  icon={<BulbOutlined />}
  onClick={handleAnalysis}
  disabled={loading}
>
  开始分析
</Button>

// 加载状态
{loading && (
  <div style={{ textAlign: 'center', padding: '50px 0' }}>
    <Spin size="large" />
    <p style={{ marginTop: 16 }}>AI 正在分析您的消费数据...</p>
  </div>
)}
```

---

## ⚙️ 配置说明

### API Key 替换步骤

**开发者需要做的**：

1. 获取你的 API Key
2. 将 Key 拆分为两部分
3. 分别进行 Base64 编码
4. 替换 `aiConfig.ts` 中的 `API_KEY_PART1` 和 `API_KEY_PART2`

**Base64 编码工具**:
```bash
# 编码
echo -n "你的API Key" | base64

# 解码
echo "编码后的字符串" | base64 -d
```

### API 选项

| 服务商 | 推荐模型 | 国内访问 |
|--------|----------|----------|
| OpenAI | gpt-4 / gpt-3.5-turbo | ❌ 需翻墙 |
| Moonshot | moonshot-v1-8k | ✅ 直接访问 |
| 百度文心 | ERNIE-4.0-8K | ✅ 直接访问 |
| 阿里千问 | qwen-turbo | ✅ 直接访问 |

---

## 📝 开发检查清单

- [ ] 创建 AI 分析页面组件
- [ ] 实现 API Key 保护逻辑
- [ ] 实现数据预处理函数
- [ ] 创建 AI Prompt 模板
- ] ] 实现 API 调用服务
- [ ] 添加路由配置
- ] 更新导航栏添加入口
- [ ] 测试不同数据范围
- [ ] 测试 API Key 保护
- [ ] 优化加载状态显示
- [ ] 美化结果展示

---

## 🚀 预期效果

### 用户体验
1. 点击导航栏 "AI 分析" 进入页面
2. 选择分析范围（默认本月）
3. 点击 "开始分析" 按钮
4. 等待 3-5 秒
5. 查看个性化的财务建议

### 技术指标
- 响应时间：< 5 秒（正常数据量）
- API 调用：每次分析 1 次 API 请求
- 成本：约 ¥0.01-0.1 元/次（取决于 API）

---

## 📌 注意事项

1. **API Key 安全**：
   - 代码中的 API Key 使用编码混淆
   - 不在日志或错误信息中暴露
   - 仓库开源前确保 Key 已编码

2. **错误处理**：
   - API 调用失败时显示友好提示
   - 网络问题时建议重试
   - API 额度超限时提示用户

3. **性能优化**：
   - 数据量 >1000 条时显示进度
   - 缓存最近一次分析结果
   - 避免重复调用（同一时间段）

4. **用户体验**：
   - 首次使用时可显示使用说明
   - 建议显示在结果底部
   - 提供 "复制" 方便分享

---

## 📊 示例数据流

```
输入: 用户选择"本月"
      ↓
预处理:
  - 从数据库查询 2025-12 月的交易记录
  - 统计各类别支出
  - 计算总支出和占比
      ↓
发送给 AI:
  总支出：3256 元
  餐饮：44.5%
  ...
      ↓
AI 返回:
  "你本月的餐饮支出占比较高...建议：..."
      ↓
展示给用户
```

---

**文档版本**: 1.0
**创建日期**: 2025-12-28
**适用版本**: v0.2.0+

---

## 🤖 给 AI 执行者的提示

1. 请严格按照本文档实现
2. 使用 Ant Design 保持风格统一
3. API Key 需要用户提供，按文档中的方式编码
4. Prompt 可以微调但核心逻辑不变
5. UI 设计参考文档中的原型图，但要更美观
6. 确保加载状态和错误处理友好
7. 测试各种边界情况（无数据、大量数据、API 失败等）

祝开发顺利！🚀
