# 21 - LLM 智能对话系统 🤖

> **难度**: ⭐⭐⭐⭐⭐ | **价值**: 🔥🔥🔥🔥🔥 | **创新度**: ⭐⭐⭐⭐⭐

---

## 📌 技术概述

### 核心功能

我们的系统集成了**多厂商LLM API**，实现了智能旅游对话助手：

| 功能 | 实现方式 |
|-----|---------|
| **多轮对话** | 会话历史管理，记住上下文 |
| **智能回复** | LLM生成自然语言回复 |
| **建议问题** | 根据对话内容推荐相关问题 |
| **多厂商支持** | 智谱/OpenAI/阿里云/百度等 |

### 技术成果

| 指标 | 数值 |
|-----|-----|
| 支持LLM厂商 | 6家 |
| 对话轮次记忆 | 最多20轮 |
| 建议问题生成 | 4个/次 |
| 响应速度 | <2秒 |

---

## 🔍 技术原理

### 系统架构

```
用户输入
    ↓
┌─────────────────────────────────────────┐
│         前端Chat组件                      │
│  发送消息到后端API                       │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│         后端API路由                      │
│  POST /api/v1/tourist/chat              │
│  参数: message, session_id              │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│         RealService.chat()              │
│  1. 获取会话历史                        │
│  2. 调用LLM API                         │
│  3. 保存到历史                          │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│         LLMClient.chat()                │
│  1. 构建消息列表（系统提示+历史+当前）   │
│  2. 发送HTTP请求                        │
│  3. 解析响应                            │
│  4. 生成建议问题                        │
└─────────────────────────────────────────┘
    ↓
返回给前端
```

### 消息格式

```python
# LLM API 请求格式
{
  "model": "glm-4-flash",
  "messages": [
    {"role": "system", "content": "你是山西文旅智能助手..."},
    {"role": "user", "content": "山西有哪些好玩的地方？"},
    {"role": "assistant", "content": "推荐..."},
    {"role": "user", "content": "这些地方门票多少钱？"}
  ],
  "temperature": 0.7,
  "max_tokens": 2000
}

# LLM API 响应格式
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "主要景点门票价格..."
      }
    }
  ],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 200,
    "total_tokens": 300
  }
}
```

---

## 💡 项目应用

### 代码位置

| 组件 | 文件位置 |
|-----|---------|
| **LLM客户端** | [backend/app/integrations/llm_client.py](../../backend/app/integrations/llm_client.py) |
| **会话管理** | [backend/app/services/session_manager.py](../../backend/app/services/session_manager.py) |
| **聊天服务** | [backend/app/services/real_service.py](../../backend/app/services/real_service.py) |

### 实现细节

#### 1. LLM客户端核心方法

```python
# backend/app/integrations/llm_client.py:95-163
async def chat(
    self,
    message: str,
    system_prompt: Optional[str] = None,
    history: Optional[list[dict]] = None,
    temperature: float = 0.7,
    max_tokens: int = 2000
) -> dict:
    """发送对话请求"""
    # 构建消息列表
    messages = []

    # 添加系统提示词
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    else:
        messages.append({
            "role": "system",
            "content": self._get_default_system_prompt()
        })

    # 添加历史记录
    if history:
        messages.extend(history)

    # 添加当前消息
    messages.append({"role": "user", "content": message})

    # 发送请求
    response = await self._send_request(
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens
    )

    return response
```

#### 2. 系统提示词

```python
# backend/app/integrations/llm_client.py:245-263
def _get_default_system_prompt(self) -> str:
    """获取默认系统提示词"""
    return """你是山西文旅智能助手，专门为游客提供山西旅游咨询服务。

你的主要职责：
1. 回答关于山西景点、美食、住宿、交通等问题
2. 提供行程规划建议
3. 介绍山西的历史文化和风土人情
4. 提供实用的旅游建议和注意事项

回答要求：
- 友好热情，专业准确
- 信息详实，有针对性
- 可以主动推荐相关内容
- 适当表达情感，让游客感受到山西的魅力

山西主要景点：平遥古城、五台山、云冈石窟、晋祠、乔家大院、北岳恒山等。
山西特色美食：刀削面、平遥牛肉、太谷饼、莜面栲栳栳、老陈醋等。
"""
```

#### 3. 建议问题生成

```python
# backend/app/integrations/llm_client.py:295-358
def _generate_suggestions(self, user_message: str, ai_reply: str) -> list[str]:
    """根据对话内容生成建议问题"""
    suggestions = []

    # 根据用户消息匹配
    if any(word in user_message for word in ["平遥", "古城"]):
        suggestions.extend([
            "平遥古城门票价格",
            "平遥住宿推荐",
            "平遥美食攻略"
        ])
    elif any(word in user_message for word in ["五台山", "佛教"]):
        suggestions.extend([
            "五台山朝台攻略",
            "五台山交通方式",
            "五台山住宿建议"
        ])
    # ... 更多匹配规则

    return suggestions[:4]  # 返回最多4个建议
```

#### 4. 聊天服务集成

```python
# backend/app/services/real_service.py:99-148
async def chat(
    self,
    message: str,
    session_id: Optional[str] = None,
    context: Optional[dict] = None
) -> dict:
    """智能对话（使用真实LLM API，支持会话历史）"""

    if self._llm_client is None:
        return await self._fallback.chat(message, session_id, context)

    try:
        # 获取会话历史
        history = None
        if session_id:
            session_mgr = get_session_manager()
            history = session_mgr.get_history(session_id)

        # 调用LLM API
        response = await self._llm_client.chat_with_suggestions(
            message=message,
            history=history
        )

        # 保存对话到会话历史
        if session_id:
            session_mgr.add_message(session_id, "user", message)
            session_mgr.add_message(session_id, "assistant", response["reply"])

        return response

    except Exception as e:
        logger.error(f"LLM call failed: {str(e)}")
        return await self._fallback.chat(message, session_id, context)
```

### 核心代码示例

```python
# backend/app/integrations/llm_client.py:27-63
class LLMClient:
    """LLM API客户端"""

    def __init__(
        self,
        provider: LLMProvider = LLMProvider.ZHIPU,
        api_key: str = "",
        model: str = "",
        base_url: str = ""
    ):
        self.provider = provider
        self.api_key = api_key
        self.model = model
        self.base_url = base_url
        self._configure_provider()

    def _configure_provider(self):
        """配置各厂商参数"""
        if self.provider == LLMProvider.ZHIPU:
            self.base_url = self.base_url or "https://open.bigmodel.cn/api/paas/v4"
            self.model = self.model or "glm-4-flash"
            self.timeout = 60.0
        elif self.provider == LLMProvider.OPENAI:
            self.base_url = self.base_url or "https://api.openai.com/v1"
            self.model = self.model or "gpt-3.5-turbo"
            # ... 其他厂商配置
```

---

## 🎯 演示话术

### 开场介绍（30秒）

```
"我们的系统集成了智能对话功能。

通过调用大型语言模型API，
实现自然流畅的多轮对话，
为游客提供实时的旅游咨询服务。"
```

### 深度讲解（2分钟）

```
"LLM智能对话系统的核心组件：

第一层：LLM客户端
支持6家主流厂商：
- 智谱AI（GLM-4）
- OpenAI（GPT-4）
- 阿里云（通义千问）
- 百度（文心一言）
- 腾讯（混元）
- 字节（豆包）

统一的接口设计，
可以灵活切换不同厂商。

第二层：会话管理
保存用户的对话历史，
最多20轮对话，
传递给LLM保持上下文连续性。

第三层：智能回复
LLM根据系统提示词、历史对话、当前问题，
生成自然流畅的回复。

第四层：建议问题
根据对话内容，
智能推荐4个相关问题，
引导用户继续探索。

整个系统让用户感觉像在和真人对话，
而不是生硬的问答机器人。"
```

### 演示互动（1分钟）

```
（切换到游客端对话界面）

"各位评委请看，这是智能对话功能：

我问：'山西有哪些好玩的地方？'
AI回答：'推荐平遥古城、五台山、云冈石窟...'
同时建议4个相关问题。

我继续问：'这些地方门票多少钱？'
AI能够理解'这些地方'指的是上面提到的景点，
给出准确的门票价格。

这就是上下文记忆带来的体验。

我还可以问具体问题：
'平遥住宿推荐'
'五台山怎么去'

AI都能给出专业、友好的回复。"
```

### 总结强调（30秒）

```
"LLM智能对话的价值：

① 自然流畅：像真人对话一样自然
② 上下文记忆：记住对话历史
③ 智能推荐：引导用户继续探索
④ 多厂商支持：灵活切换LLM提供商

这是我们系统的核心竞争力！"
```

---

## 📊 对比优势

### 与传统问答系统对比

| 维度 | 传统问答 | LLM智能对话 |
|-----|---------|------------|
| 回复质量 | 模板化 | 自然流畅 |
| 上下文记忆 | ❌ | ✅ |
| 理解能力 | 关键词匹配 | 语义理解 |
| 扩展性 | 差 | 好（更新提示词） |

### 多厂商对比

| LLM厂商 | 模型 | 优势 | 价格 |
|--------|------|------|------|
| 智谱AI | GLM-4 | 中文友好，速度快 | 低 |
| OpenAI | GPT-4 | 能力最强 | 高 |
| 阿里云 | 通义千问 | 中文优化 | 中 |
| 百度 | 文心一言 | 中文场景 | 中 |

---

## 🚀 应用场景/扩展性

### 应用场景

1. **旅游咨询**: 景点、美食、住宿、交通
2. **行程规划**: 根据需求生成旅游线路
3. **实时建议**: 天气、客流等实时信息
4. **文化讲解**: 历史文化、风土人情

### 扩展性

可以扩展到更多场景：
- **企业客服**: 回答企业相关问题
- **政务咨询**: 政策解读、办事指南
- **多语言支持**: 英文、日文等国际游客

---

## 🏆 总结

### 核心价值

1. **用户体验**: ⭐⭐⭐⭐⭐
   - 自然流畅的对话体验

2. **技术先进**: ⭐⭐⭐⭐⭐
   - 集成最新LLM技术

3. **业务价值**: ⭐⭐⭐⭐⭐
   - 降低人工客服成本

### 演示建议

- **最佳展示位置**: 游客端对话演示
- **演示时长**: 2-3分钟
- **关键话术**: "智能对话，像真人一样"
- **视觉冲击**: 多轮对话演示

---

**文档版本**: v1.0
**最后更新**: 2026-01-02
**作者**: 山西文旅智能体团队
