# masyun-toolkit

AI编程项目分享，用于学习和使用

---

## 📦 Claude Code + GLM 4.6 安装包

### 快速开始

想用 Claude Code 但不想注册海外账号？用国产 GLM-4.6 模型驱动，成本更低！

**[点击下载完整安装包](./claude-code-glm46-install-kit/)**

### 安装包内容

```
claude-code-glm46-install-kit/
├── Git-2.52.0-64-bit.exe          # Git Bash 安装程序
├── node-v24.12.0-x64.msi           # Node.js 安装程序
├── .claude.json                    # 用户配置模板
├── settings.json                   # API 配置模板
└── Claude-Code-GLM-安装指南.md     # 完整安装文档
```

### 5分钟快速配置

1. **下载安装包**：从本仓库的 `claude-code-glm46-install-kit` 目录下载所有文件
2. **安装 Node.js**：双击 `node-v24.12.0-x64.msi`
3. **安装 Git Bash**：双击 `Git-2.52.0-64-bit.exe`
4. **配置环境变量**（管理员 PowerShell）：
   ```powershell
   [System.Environment]::SetEnvironmentVariable('CLAUDE_CODE_GIT_BASH_PATH', 'C:\Program Files\Git\bin\bash.exe', 'User')
   ```
5. **安装 Claude Code**：
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```
6. **配置 API**：将 `settings.json` 复制到 `C:\Users\你的用户名\.claude\`，替换为你自己的智谱 API 密钥
7. **配置用户**：将 `.claude.json` 复制到 `C:\Users\你的用户名\`，替换用户名

详细说明请查看：[Claude-Code-GLM-安装指南.md](./claude-code-glm46-install-kit/Claude-Code-GLM-安装指南.md)

### 获取智谱 API 密钥

访问 [智谱AI开放平台](https://open.bigmodel.cn/)，注册后即可获取 API 密钥。

### 优势

- ✅ 无需海外账号
- ✅ 无需国际信用卡
- ✅ API 成本降低 90%+
- ✅ 国内网络直连
- ✅ 功能完全相同

---

## 其他资源

- [完整可视化教程](https://github.com/ALL2006/masyun-toolkit) - 包含交互式演示
- [AI自进化记](https://github.com/ALL2006/masyun-toolkit) - GLM 模型自我进化实录

---

## 许可证

[LICENSE](LICENSE)

---

**作者**：架构狮与橘
**更新时间**：2026年1月
