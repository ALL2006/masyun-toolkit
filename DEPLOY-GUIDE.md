# 部署到 Cloudflare Pages 指南

本指南将帮助您将 Jekyll 博客部署到 Cloudflare Pages。

## 前置条件

1. GitHub 仓库：https://github.com/ALL2006/masyun-toolkit
2. Cloudflare 账号（免费）
3. 本地已安装 Ruby 和 Bundler（用于本地测试）

## 方式一：通过 Cloudflare Dashboard 部署

### 步骤 1：推送代码到 GitHub

首先，确保您的所有更改已推送到 GitHub 仓库：

```bash
cd e:/工作区/masyun-toolkit
git add .
git commit -m "添加 Jekyll 博客结构"
git push origin main
```

### 步骤 2：登录 Cloudflare Dashboard

1. 访问：https://dash.cloudflare.com/
2. 登录您的账号

### 步骤 3：创建新项目

1. 在左侧菜单中，点击 **Workers & Pages**
2. 点击 **Create application** / **创建应用**
3. 选择 **Pages** 标签
4. 点击 **Connect to Git** / **连接到 Git**

### 步骤 4：连接 GitHub 仓库

1. 如果是第一次使用，需要授权 Cloudflare 访问您的 GitHub
2. 选择您的仓库：`ALL2006/masyun-toolkit`
3. 点击 **Begin setup** / **开始设置**

### 步骤 5：配置构建设置

在 **Build settings** 中设置：

```
Build command: bundle exec jekyll build
Build output directory: _site
```

**环境变量**（如果需要）：

```
LANG: en_US.UTF-8
LC_ALL: en_US.UTF-8
```

### 步骤 6：部署

1. 点击 **Save and Deploy** / **保存并部署**
2. 等待构建完成（大约 1-3 分钟）
3. 部署成功后，您会获得一个 `*.pages.dev` 域名

## 方式二：通过 Cloudflare CLI (Wrangler) 部署

### 安装 Wrangler

```bash
npm install -g wrangler
```

### 登录

```bash
wrangler login
```

### 创建部署配置

在项目根目录创建 `wrangler.toml`：

```toml
name = "masyun-toolkit"
compatibility_date = "2024-01-01"

[env.production]
routes = [
  { pattern = "your-domain.com/*", zone_name = "your-domain.com" }
]
```

### 部署

```bash
# 先在本地构建
bundle install
bundle exec jekyll build

# 部署到 Cloudflare Pages
npx wrangler pages deploy _site --project-name=masyun-toolkit
```

## 自定义域名

### 绑定自定义域名

1. 在 Cloudflare Pages 项目中，点击 **Custom domains** / **自定义域名**
2. 点击 **Set up a custom domain** / **设置自定义域名**
3. 输入您的域名（例如：`blog.yourdomain.com`）
4. 按照提示完成 DNS 配置

### 更新 Jekyll 配置

绑定自定义域名后，更新 `_config.yml`：

```yaml
baseurl: ""
url: "https://blog.yourdomain.com"
```

## 本地测试

在部署前，您可以在本地测试博客：

### 安装依赖

```bash
cd e:/工作区/masyun-toolkit
bundle install
```

### 启动本地服务器

```bash
bundle exec jekyll serve
```

访问：http://localhost:4000

## 添加新文章

### 创建新文章

在 `_posts` 目录下创建新文件，文件名格式：

```
_year-month-day-title.md
```

例如：

```bash
# 2026-01-15-my-new-post.md
---
layout: post
title: 我的新文章
date: 2026-01-15 10:00:00 +0800
categories: [技术]
tags: [Jekyll, 博客]
---

文章内容...
```

### 推送更新

```bash
git add .
git commit -m "添加新文章"
git push origin main
```

Cloudflare Pages 会自动检测更新并重新部署。

## 常见问题

### 构建失败

1. 检查 `_config.yml` 语法是否正确
2. 确保 `Gemfile` 存在且语法正确
3. 查看 Cloudflare Pages 构建日志

### 样式未加载

1. 检查 `baseurl` 设置是否正确
2. 确保样式文件在 `_layouts` 目录中

### 分页不工作

确保安装了 `jekyll-paginate` 插件，并在 `_config.yml` 中正确配置。

## 下一步

- 🎨 自定义博客样式
- 📝 添加更多文章
- 🔧 添加评论系统（如 Disqus, Giscus）
- 📊 集成 Google Analytics
- 🔍 配置 SEO 优化

---

如有问题，请查阅：
- [Jekyll 官方文档](https://jekyllrb.com/docs/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
