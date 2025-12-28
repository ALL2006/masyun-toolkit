# 镜像加速更新配置说明

## 配置概述

本项目使用国内镜像加速自动更新下载：

- **镜像地址**: `https://gh-proxy.com/https://github.com/ALL2006/masyun-toolkit/releases/download`
- **备用镜像**: `https://ghproxy.net/...`

## 工作原理

```
用户应用 (0.3.0+)
    ↓
electron.js 配置: setFeedURL(镜像地址)
    ↓
请求: https://gh-proxy.com/.../download/latest.yml
    ↓
gh-proxy.com 转发 → GitHub
    ↓
返回 latest.yml (files[0].url 已配置镜像)
    ↓
从 files[0].url 下载 (已是镜像地址)
```

## 发布新版本流程

### 方式 1：使用自动脚本（推荐）

```powershell
.\publish-with-mirror.ps1
```

脚本会自动：
1. 构建应用
2. 生成包含镜像配置的 latest.yml
3. 提示上传到 GitHub

### 方式 2：手动发布

```bash
# 1. 构建应用
npm run build
npm run build-electron-win

# 2. 修改 latest.yml（添加镜像）
```

修改 `dist/latest.yml`，确保 `files[0].url` 使用完整镜像地址：

```yaml
version: 0.3.1
files:
  - url: https://gh-proxy.com/https://github.com/ALL2006/masyun-toolkit/releases/download/v0.3.1/finance-tracker-setup-0.3.1.exe
    sha512: <计算的 sha512>
    size: <文件大小>
path: finance-tracker-setup-0.3.1.exe
sha512: <计算的 sha512>
releaseDate: '2025-12-28T12:00:00.000Z'
```

```bash
# 3. 上传到 GitHub
# 访问 https://github.com/ALL2006/masyun-toolkit/releases/new
# 上传:
#   - dist/finance-tracker-setup-0.3.1.exe
#   - dist/latest.yml (修改后的)
```

## 关键配置文件

### package.json

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "ALL2006",
      "repo": "masyun-toolkit"
    }
  }
}
```

### public/electron.js

```javascript
// 强制使用 generic provider + 镜像地址
const MIRROR_BASE_URL = 'https://gh-proxy.com/https://github.com/ALL2006/masyun-toolkit/releases/download';
autoUpdater.setFeedURL(MIRROR_BASE_URL);
```

## 验证镜像生效

安装新版本后，查看日志文件：
```
C:\Users\<用户名>\App\Roaming\大学生记账本\logs\
```

搜索关键字：
- `Update feed URL set to mirror` - 确认镜像地址已设置
- `gh-proxy.com` - 确认下载使用镜像

## 故障排除

### 问题：检查更新失败

**原因**: latest.yml 未配置镜像 URL

**解决**: 确保 `latest.yml` 中 `files[0].url` 是完整的镜像地址

### 问题：下载仍然慢

**原因**: 应用版本 < 0.3.0，没有镜像配置

**解决**: 手动下载 0.3.0+ 版本：
```
https://gh-proxy.com/https://github.com/ALL2006/masyun-toolkit/releases/download/v0.3.0/finance-tracker-setup-0.3.0.exe
```

## 镜像列表

| 镜像 | 状态 | URL |
|------|------|-----|
| gh-proxy.com | ✅ 主镜像 | https://gh-proxy.com |
| ghproxy.net | ✅ 备用 | https://ghproxy.net |
| mirror.ghproxy.com | ⚠️ 待测试 | https://mirror.ghproxy.com |

## 更新镜像

如需更换镜像，修改：
1. `public/electron.js` 中的 `MIRROR_BASE_URL`
2. `publish-with-mirror.ps1` 中的镜像地址
