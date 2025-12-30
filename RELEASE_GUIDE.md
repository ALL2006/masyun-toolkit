# TimelineFlow 发布流程指南

本文档详细说明 TimelineFlow 项目的完整发布流程。

---

## 目录

1. [发布前准备](#发布前准备)
2. [版本号管理](#版本号管理)
3. [构建应用](#构建应用)
4. [发布到 GitHub](#发布到-github)
5. [发布到 Gitee](#发布到-gitee)
6. [代码提交](#代码提交)
7. [完整发布示例](#完整发布示例)
8. [常见问题](#常见问题)

---

## 发布前准备

### 环境要求

- Node.js >= 16.x
- npm >= 8.x
- PowerShell
- Git

### 必需的 Token

#### GitHub Token
1. 访问 https://github.com/settings/tokens
2. 生成新的 Personal Access Token (classic)
3. 权限勾选 `repo`
4. 保存 token（格式：`ghp_xxxxxxxxxxxx`）

#### Gitee Token
1. 访问 https://gitee.com/profile/personal_access_tokens
2. 生成新的私人令牌
3. 权限勾选 `projects`
4. 保存 token（格式：32位字符串）

### Token 配置方式

发布脚本使用环境变量读取 token，有两种配置方式：

**方式 1：临时环境变量（推荐）**
```powershell
# GitHub
$env:GITHUB_TOKEN = "ghp_your_token_here"

# Gitee
$env:GITEE_TOKEN = "your_gitee_token_here"
```

**方式 2：系统环境变量**
```
1. 右键"此电脑" -> 属性 -> 高级系统设置
2. 环境变量 -> 新建用户变量
3. 变量名: GITHUB_TOKEN / GITEE_TOKEN
4. 变量值: 你的 token
```

---

## 版本号管理

### 版本号格式

```
v主版本.次版本.修订版本-timeline

例如: v1.0.0-timeline
```

### 版本号更新规则

| 变更类型 | 版本号变化 | 示例 |
|---------|-----------|------|
| 重大更新/不兼容变更 | 主版本+1 | 1.0.0 → 2.0.0 |
| 新功能 | 次版本+1 | 1.0.0 → 1.1.0 |
| Bug 修复/小改进 | 修订版本+1 | 1.0.0 → 1.0.1 |

### 更新版本号

1. 编辑 [todo-app-react-scripts/package.json](todo-app-react-scripts/package.json)
2. 修改 `version` 字段
3. 保存文件

```json
{
  "name": "todo-app-react-scripts",
  "version": "1.0.1",  // 修改这里
  ...
}
```

---

## 构建应用

### 关闭运行中的应用

构建前必须关闭所有运行中的应用实例：

```powershell
# 方法 1：使用脚本
.\todo-app-react-scripts\scripts\kill-app.ps1

# 方法 2：手动关闭
taskkill /F /IM "待办事项管理.exe"
```

### 执行构建

```bash
# 进入项目目录
cd d:\todo-management-platform\todo-app-react-scripts

# 构建 Windows 安装包
npm run build-electron-win-unsigned
```

### 构建验证

构建成功后，检查 `dist` 目录：

```bash
# 查看生成的文件
ls dist

# 应该包含以下文件：
# - todo-app-setup-{version}.exe      (约 100MB)
# - todo-app-setup-{version}.exe.blockmap
# - builder-debug.yml
# - win-unpacked/                     (解压版本)
```

---

## 发布到 GitHub

### 自动发布（推荐）

```powershell
# 1. 设置 token
$env:GITHUB_TOKEN = "ghp_your_token_here"

# 2. 执行发布脚本
npm run release:github

# 或指定版本号
.\scripts\publish-github.ps1 1.0.1
```

### 发布脚本功能

发布脚本会自动：
- ✅ 验证构建文件是否存在
- ✅ 检查 Release 是否存在
- ✅ 删除旧版本的附件
- ✅ 上传新版本的 EXE、BLOCKMAP、YML 文件
- ✅ 显示下载链接

### 验证发布

访问 GitHub Release 页面：
```
https://github.com/ALL2006/masyun-toolkit/releases/tag/v{version}-timeline
```

确认以下文件已上传：
- `todo-app-setup-{version}.exe`
- `todo-app-setup-{version}.exe.blockmap`
- `builder-debug.yml`

---

## 发布到 Gitee

### 手动发布（当前唯一方式）

由于 Gitee API 限制，需要手动上传文件：

#### 步骤 1：访问 Gitee Release 页面
```
https://gitee.com/haobinjun/masyun-toolkit/releases
```

#### 步骤 2：找到对应版本
- 找到 `v{version}-timeline` 版本
- 如果不存在，点击"新建发布"

#### 步骤 3：上传文件
点击"编辑附件"或"上传附件"，上传以下文件：
- `dist/todo-app-setup-{version}.exe`
- `dist/builder-debug.yml`

#### 步骤 4：保存发布
点击"确定/保存"完成发布

### 自动化尝试（可选）

可以使用脚本尝试自动发布，但可能失败：

```powershell
# 设置 token
$env:GITEE_TOKEN = "your_gitee_token"

# 尝试发布
npm run release:gitee
```

---

## 代码提交

### 查看修改状态

```bash
cd d:\todo-management-platform
git status
```

### 添加并提交

```bash
# 添加所有修改
git add -A

# 提交（使用模板）
git commit -m "release: TimelineFlow v{version}

## 功能更新
- 功能描述 1
- 功能描述 2

## 问题修复
- 修复问题 1
- 修复问题 2
"
```

### 推送到远程仓库

```bash
# 推送到 GitHub
git push github timeline-todo

# 推送到 Gitee
git push gitee timeline-todo
```

---

## 完整发布示例

### 发布 v1.0.1 版本

```powershell
# ====================
# 1. 准备工作
# ====================

# 设置 token (替换为你的实际 token)
$env:GITHUB_TOKEN = "ghp_your_github_token_here"
$env:GITEE_TOKEN = "your_gitee_token_here"

# 进入项目目录
cd d:\todo-management-platform\todo-app-react-scripts

# ====================
# 2. 更新版本号
# ====================

# 编辑 package.json，将版本号改为 1.0.1
# notepad package.json

# ====================
# 3. 构建应用
# ====================

# 关闭运行中的应用
.\scripts\kill-app.ps1

# 构建安装包
npm run build-electron-win-unsigned

# 验证构建文件
ls dist

# ====================
# 4. 发布到 GitHub
# ====================

npm run release:github

# ====================
# 5. 手动发布到 Gitee
# ====================

# 访问 https://gitee.com/haobinjun/masyun-toolkit/releases
# 手动上传文件

# ====================
# 6. 提交代码
# ====================

cd ..
git add -A
git commit -m "release: TimelineFlow v1.0.1

- 修复已知问题
- 优化性能"

git push github timeline-todo
git push gitee timeline-todo
```

---

## 常见问题

### Q1: 构建失败 - 文件被占用

**错误信息**：
```
remove d3dcompiler_47.dll: Access is denied.
```

**解决方法**：
```powershell
# 关闭所有应用实例
.\scripts\kill-app.ps1

# 或手动关闭
taskkill /F /IM "待办事项管理.exe"

# 重新构建
npm run build-electron-win-unsigned
```

### Q2: GitHub 发布失败 - Token 无效

**错误信息**：
```
401 Unauthorized
```

**解决方法**：
1. 检查 token 是否正确
2. 确认 token 有 `repo` 权限
3. 重新生成 token

### Q3: GitHub 推送被拒绝 - 包含敏感信息

**错误信息**：
```
Push cannot contain secrets
```

**解决方法**：
1. 检查脚本中是否硬编码了 token
2. 使用环境变量代替硬编码
3. 修改提交历史（如需要）

### Q4: Gitee 发布失败 - API 不支持

**错误信息**：
```
404 Not Found
```

**解决方法**：
Gitee API 不支持命令行上传文件，请手动上传到 Release 页面。

### Q5: 版本号冲突

**错误信息**：
```
Release already exists
```

**解决方法**：
1. 检查是否已发布该版本
2. 更新版本号
3. 或删除旧 Release 后重新发布

---

## 发布检查清单

发布前请确认：

- [ ] 版本号已更新（package.json）
- [ ] 所有应用实例已关闭
- [ ] 构建成功，文件完整
- [ ] GitHub 环境变量已设置
- [ ] README.md 已更新（如需要）
- [ ] 更新日志已准备
- [ ] 已在本地测试安装包

发布后请确认：

- [ ] GitHub Release 文件已上传
- [ ] Gitee Release 文件已上传
- [ ] 代码已推送到两个仓库
- [ ] 下载链接可访问
- [ ] 安装包可正常安装运行

---

## 相关文件

| 文件 | 说明 |
|------|------|
| [package.json](todo-app-react-scripts/package.json) | 版本号和脚本配置 |
| [scripts/publish-github.ps1](todo-app-react-scripts/scripts/publish-github.ps1) | GitHub 发布脚本 |
| [scripts/publish-gitee.ps1](todo-app-react-scripts/scripts/publish-gitee.ps1) | Gitee 发布脚本 |
| [scripts/publish-all.ps1](todo-app-react-scripts/scripts/publish-all.ps1) | 双平台发布脚本 |
| [README.md](todo-app-react-scripts/README.md) | 项目说明文档 |

---

## 联系与支持

如有问题，请：
- 提交 Issue: https://github.com/ALL2006/masyun-toolkit/issues
- 查看文档: [README.md](todo-app-react-scripts/README.md)

---

**最后更新**: 2024-12-30
**当前版本**: v1.0.0
