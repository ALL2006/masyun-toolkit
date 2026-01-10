# 37 - Docker 容器化部署 🐳

> **难度**: ⭐⭐⭐ | **价值**: 🔥🔥🔥 | **创新度**: ⭐⭐⭐ |

---

## 📌 技术概述

### 核心功能

我们的系统实现了**Docker容器化部署**，确保环境一致性和部署便利性：

| 功能 | 实现方式 |
|-----|---------|
| **前端容器化** | Nginx + React构建产物 |
| **后端容器化** | FastAPI + Uvicorn |
| **一键部署** | Docker Compose编排 |
| **环境隔离** | 独立容器，互不影响 |

### 技术成果

| 指标 | 数值 |
|-----|-----|
| 容器数量 | 2个（frontend + backend） |
| 镜像大小 | 前端~50MB，后端~200MB |
| 启动时间 | <30秒 |
| 部署复杂度 | 一条命令 |

---

## 🔍 技术原理

### Docker Compose 架构

```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - ENV=production

  frontend:
    build: ./frontend
    ports: ["80:80"]
    depends_on: [backend]
```

### 容器通信

```
浏览器
    ↓
Nginx容器 (80端口)
    ↓ (代理)
后端容器 (8000端口)
```

---

## 💡 项目应用

### 代码位置

| 文件 | 用途 |
|-----|------|
| [docker-compose.yml](../../docker-compose.yml) | 容器编排 |
| [backend/Dockerfile](../../backend/Dockerfile) | 后端镜像构建 |
| [frontend/Dockerfile](../../frontend/Dockerfile) | 前端镜像构建 |

### 实现细节

#### 1. 后端 Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. 前端 Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### 3. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    container_name: shanxi-tourism-backend
    ports:
      - "8000:8000"
    environment:
      - ENV=production
      - LLM_PROVIDER=${LLM_PROVIDER:-zhipu}
      - LLM_API_KEY=${LLM_API_KEY}
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: shanxi-tourism-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

---

## 🎯 演示话术

### 开场介绍（30秒）

```
"我们的系统实现了Docker容器化部署。

一条命令就能启动整个系统，
无需配置复杂的环境，
大大降低了部署难度。"
```

### 深度讲解（1分钟）

```
"Docker容器化部署的优势：

第一层：环境一致性
开发、测试、生产环境完全一致，
不会出现'我这里没问题，你那里报错'。

第二层：快速部署
一条命令启动所有服务：
```
docker-compose up -d
```

第三层：资源隔离
前端、后端运行在独立容器中，
互不干扰，便于管理。

第四层：易于扩展
可以轻松添加新服务，
比如数据库、缓存等。"
```

---

## 📊 对比优势

| 维度 | 传统部署 | Docker部署 |
|-----|---------|----------|
| 环境配置 | 复杂 | 简单 |
| 部署时间 | ~30分钟 | ~2分钟 |
| 环境一致性 | 差 | 优 |
| 资源隔离 | 无 | 有 |

---

## 🏆 总结

**核心价值**：一条命令部署，环境一致性强。

**演示建议**：展示docker-compose.yml，说明部署命令。

---

**文档版本**: v1.0
**最后更新**: 2026-01-02
**作者**: 山西文旅智能体团队
