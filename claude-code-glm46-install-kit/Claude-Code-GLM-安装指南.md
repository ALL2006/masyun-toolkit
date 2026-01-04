# Claude Code + GLM 4.6 安装指南

本文档指导你如何在 Windows 上安装并配置 Claude Code，使用智谱 AI 的 GLM-4.6 模型。

---

## 前置要求

- Windows 操作系统
- 管理员权限（用于配置环境变量）
- 智谱 AI 账号（用于获取 API 密钥）

---

## 安装步骤

### 第一步：获取 API 密钥

1. 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 在控制台获取你的 API 密钥（API Key）
4. **保存好这个密钥**，后续配置时会用到

> API 密钥是一串以 `.wEqoN5ss5jTpFLzK` 结尾的字符串

#### 为什么要这样做？

Claude Code 默认连接到 Anthropic 的官方 API（使用 Claude 模型）。为了让它使用智谱 AI 的 GLM-4.6 模型，我们需要：
- **API 密钥**：这是你的身份凭证，证明你有权限使用智谱 AI 的服务
- **费用更低**：相比 Claude 官方 API，智谱 AI 的价格更实惠
- **国产模型**：GLM-4.6 是智谱 AI 自研的大语言模型

---

### 第二步：安装 Node.js

1. 双击运行 `node-v24.12.0-x64.msi`
2. 按照安装向导完成安装
3. 安装完成后，npm 会自动随 Node.js 一起安装（无需单独安装 npm）

> 验证安装：打开 PowerShell 输入 `node -v` 和 `npm -v`

#### 为什么要这样做？

- **Node.js**：JavaScript 运行环境，Claude Code 本身是用 Node.js 编写的
- **npm**：Node.js 的包管理器（类似 Python 的 pip），用于安装 Claude Code

```
npm ──下载并安装──→ Claude Code
 ↑
Node.js 自带
```

---

### 第三步：安装 Git Bash

1. 双击运行 `Git-2.52.0-64-bit.exe`
2. 按照安装向导完成安装
3. 记住安装路径（默认为 `C:\Program Files\Git\`）

#### 为什么要这样做？

- **Git Bash**：在 Windows 上提供 Linux 风格的命令行环境
- **Claude Code 依赖**：Claude Code 的某些功能（如执行脚本命令）需要通过 Bash 来执行
- **兼容性**：很多开发工具默认使用 Bash 命令，Git Bash 让 Windows 也能兼容

```
Windows 命令行 (CMD/PowerShell)
         ↓
    Claude Code 需要执行命令
         ↓
    Git Bash (提供 Linux 命令环境)
```

---

### 第四步：配置环境变量

1. 右键点击 **开始菜单**，选择 **终端(管理员)** 或 **PowerShell (管理员)**
2. 执行以下命令：

```powershell
[System.Environment]::SetEnvironmentVariable('CLAUDE_CODE_GIT_BASH_PATH', 'C:\Program Files\Git\bin\bash.exe', 'User')
```

> 如果你的 Git 安装路径不同，请修改上述路径

#### 为什么要这样做？

- **环境变量**：告诉系统"在哪里可以找到 Git Bash"
- **CLAUDE_CODE_GIT_BASH_PATH**：Claude Code 专门使用这个变量来定位 Bash
- **管理员权限**：修改系统环境变量需要管理员权限

```
Claude Code 查找 Git Bash
         ↓
读取环境变量: CLAUDE_CODE_GIT_BASH_PATH
         ↓
找到路径: C:\Program Files\Git\bin\bash.exe
```

---

### 第五步：安装 Claude Code

在 PowerShell 中执行以下命令：

```bash
npm install -g @anthropic-ai/claude-code
```

> 等待安装完成，可能需要几分钟时间

#### 为什么要这样做？

- **npm install**：从 npm 仓库下载并安装 Claude Code
- **-g**：全局安装（global），让系统任何位置都能使用 Claude Code
- **@anthropic-ai/claude-code**：Claude Code 的官方包名

```
npm 仓库 (互联网)
     ↓
npm 下载 @anthropic-ai/claude-code
     ↓
安装到全局目录 (系统任何位置可用)
```

---

### 第六步：配置用户名

1. 获取你的用户名：在 PowerShell 中执行 `echo $env:USERNAME`，将显示你的用户名
2. 将外层文件夹中的 **`.claude.json`** 复制到以下位置：
   ```
   C:\Users\你的用户名\.claude.json
   ```
3. 用文本编辑器打开该文件，搜索并替换所有 `Administrator` 为你的用户名

需要修改的位置示例：
```json
"C:/Users/Administrator"  →  "C:/Users/你的用户名"
```

#### 为什么要这样做？

- **用户配置文件**：`.claude.json` 存储用户个性化的设置和项目路径
- **路径匹配**：Claude Code 需要知道你的用户目录路径才能正确管理项目
- **Administrator**：这是示例用户的名称，需要替换成你自己的

```
原始配置 (来自 Administrator 电脑)
         ↓
   替换用户名为你自己的
         ↓
Claude Code 能识别你的项目路径
```

---

### 第七步：配置 API 密钥

1. 将内层文件夹中的 **`settings.json`** 复制到以下位置：
   ```
   C:\Users\你的用户名\.claude\settings.json
   ```
2. **重要**：打开该文件，将 `ANTHROPIC_AUTH_TOKEN` 的值替换为你自己的 API 密钥

示例配置：
```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "你的API密钥",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "GLM-4.6",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "GLM-4.6",
    "ANTHROPIC_MODEL": "GLM-4.6"
  }
}
```

#### 为什么要这样做？

这是**最关键的一步**，将 Claude Code 从默认的 Claude API 切换到智谱 AI：

| 配置项 | 作用 |
|--------|------|
| `ANTHROPIC_AUTH_TOKEN` | 你的智谱 API 密钥，身份认证凭证 |
| `ANTHROPIC_BASE_URL` | 智谱 AI 的 API 地址（覆盖默认地址） |
| `ANTHROPIC_MODEL` | 强制使用 GLM-4.6 模型 |

```
配置前：Claude Code ──→ Anthropic API (Claude, 付费高)
配置后：Claude Code ──→ 智谱 AI API (GLM-4.6, 付费低)
              ↑
        通过环境变量重定向
```

---

### 第八步：安装 VSCode

1. 访问 [VSCode 官网](https://code.visualstudio.com/)
2. 下载 Windows 版本的安装程序
3. 双击运行安装程序，按照向导完成安装
4. 安装完成后，打开 VSCode

> 验证安装：打开 VSCode，能看到欢迎界面

#### 为什么要这样做？

- **VSCode**：目前最流行的代码编辑器，对 Claude Code 提供官方支持
- **Claude 扩展**：VSCode 的 Claude 扩展提供了图形界面，让你可以在编辑器中直接与 Claude 对话
- **集成体验**：不需要切换窗口，在写代码的同时就能获得 AI 辅助

```
VSCode (编辑器)
    ↓
安装 Claude 扩展
    ↓
在编辑器中直接使用 Claude Code
```

---

### 第九步：安装 Claude 扩展

1. 打开 VSCode
2. 点击左侧的 **扩展** 图标（或按 `Ctrl+Shift+X`）
3. 在搜索框中输入 `Claude`
4. 找到 **Claude Code** 扩展（发布者：Anthropic）
5. 点击 **安装** 按钮

> 安装完成后，VSCode 左侧会出现 Claude 图标

#### 为什么要这样做？

- **Claude 扩展**：这是连接 VSCode 和 Claude Code 的桥梁
- **无需命令行**：不需要打开终端输入命令，直接在 VSCode 中使用
- **代码上下文**：扩展可以理解你当前打开的代码文件，提供更精准的帮助

```
VSCode ──安装扩展──→ Claude Code
                            ↓
                    直接在编辑器中使用
                    （查看代码、执行命令等）
```

---

## 安装完成后

1. **重启 VSCode**：关闭并重新打开 VSCode
2. **打开 Claude 面板**：点击左侧的 Claude 图标
3. **开始使用**：在对话框中输入问题，Claude Code 将使用 GLM-4.6 模型回答

### 如何验证安装成功？

在 VSCode 的 Claude 面板中输入：
```
你好，请告诉我你使用的是什么模型？
```

如果回复中提到 **GLM-4.6**，说明配置成功！

---

## 配置文件位置总结

| 文件 | 目标位置 |
|------|----------|
| `.claude.json` | `C:\Users\你的用户名\.claude.json` |
| `settings.json` | `C:\Users\你的用户名\.claude\settings.json` |

---

## 常见问题

### Q: 如何获取我的用户名？
A: 在 PowerShell 中执行 `echo $env:USERNAME`

### Q: npm 安装失败怎么办？
A: 确保以管理员身份运行 PowerShell，或检查网络连接

### Q: Claude Code 无法识别 Git Bash？
A: 检查环境变量是否正确配置：`echo $env:CLAUDE_CODE_GIT_BASH_PATH`

### Q: VSCode 中找不到 Claude 扩展？
A: 确保网络连接正常，扩展发布者应为 "Anthropic"

### Q: Claude 扩展显示连接错误？
A: 检查 API 密钥是否正确配置，以及网络是否能访问智谱 AI

### Q: 如何确认使用的是 GLM-4.6？
A: 在 Claude 面板询问"你使用的是什么模型？"，回复中应包含 GLM-4.6

---

## 文件清单

本安装包包含以下文件：

| 文件 | 说明 |
|------|------|
| `node-v24.12.0-x64.msi` | Node.js 安装程序 |
| `Git-2.52.0-64-bit.exe` | Git for Windows 安装程序 |
| `.claude.json` | Claude API 配置模板（外层） |
| `settings.json` | Claude Code 设置模板（内层） |
| `Claude-Code-GLM-安装指南.md` | 本文档 |

---

## 整体架构原理

### 完整技术栈

```
┌─────────────────────────────────────────────────────────────┐
│                        用户界面层                            │
│         VSCode + Claude 扩展 (图形界面)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                        应用层                               │
│  VSCode / 终端 ──使用──→ Claude Code                        │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    配置层 (环境变量)                         │
│  .claude.json        settings.json                         │
│  (用户路径配置)      (API 密钥 & 模型配置)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Node.js    │  │   Git Bash   │  │   智谱 AI    │
│  (运行环境)   │  │ (命令执行)   │  │   (API)      │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 安装步骤逻辑关系

```
第一步：API 密钥 ──────────────────────┐
                                         │
第二步：Node.js ──→ 第三步：Git Bash     │
                   (提供运行环境)        │
                                         │
                第四步：环境变量 ─────────┤
                (告诉 Claude Git 路径)   │
                                         │
第五步：安装 Claude Code ◄──────────────┘
                                         │
第六步：配置用户名 ──────────────────────┤
(让 Claude 知道你的项目路径)             │
                                         │
第七步：配置 API 密钥 ───────────────────┤
(连接到智谱 AI 而非 Anthropic)           │
                                         │
第八步：安装 VSCode ─────────────────────┤
(提供图形界面)                          │
                                         │
第九步：安装 Claude 扩展 ────────────────┘
(在 VSCode 中使用 Claude Code)
```

### 核心原理：API 重定向

Claude Code 默认设计是连接 Anthropic 的官方 API。我们通过**环境变量覆盖**的方式，让它连接到智谱 AI 的兼容接口：

```javascript
// Claude Code 内部逻辑（简化）
const apiBaseUrl = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";

// 如果我们设置了环境变量：
// ANTHROPIC_BASE_URL = "https://open.bigmodel.cn/api/anthropic"
// ANTHROPIC_AUTH_TOKEN = "你的智谱密钥"
// ANTHROPIC_MODEL = "GLM-4.6"
//
// 那么 Claude Code 就会连接到智谱 AI！
```

### 文件结构总结

```
C:\Users\你的用户名\
├── .claude.json              ← 用户设置（项目路径等）
└── .claude\
    └── settings.json         ← API 配置（密钥、模型等）
```

---

*安装指南版本：1.2*
*适用于：Claude Code + GLM-4.6*
