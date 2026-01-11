---
layout: page
title: 项目展示
---

<style>
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .project-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
  }

  .project-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.5rem;
  }

  .project-title {
    font-size: 1.3rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .project-links a {
    color: white;
    text-decoration: none;
    margin-right: 1rem;
    opacity: 0.9;
  }

  .project-links a:hover {
    opacity: 1;
    text-decoration: underline;
  }

  .project-body {
    padding: 1.5rem;
  }

  .project-description {
    color: #4a5568;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .project-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tech-badge {
    background: #f7fafc;
    color: #4a5568;
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.85rem;
  }
</style>

<div class="projects-grid">
  <div class="project-card">
    <div class="project-header">
      <div class="project-title">🚀 masyun-toolkit</div>
      <div class="project-links">
        <a href="https://github.com/ALL2006/masyun-toolkit" target="_blank">GitHub</a>
      </div>
    </div>
    <div class="project-body">
      <p class="project-description">AI 编程项目分享工具，包含 Claude Code + GLM 4.6 安装包，提供一键安装配置方案。</p>
      <div class="project-tech">
        <span class="tech-badge">Claude Code</span>
        <span class="tech-badge">GLM-4.6</span>
        <span class="tech-badge">AI 编程</span>
      </div>
    </div>
  </div>

  <div class="project-card">
    <div class="project-header">
      <div class="project-title">🔮 风水 AI</div>
      <div class="project-links">
        <a href="#">GitHub</a>
      </div>
    </div>
    <div class="project-body">
      <p class="project-description">基于 AI 的传统风水分析系统，融合传统文化与现代 AI 技术。</p>
      <div class="project-tech">
        <span class="tech-badge">AI</span>
        <span class="tech-badge">传统文化</span>
        <span class="tech-badge">Web 应用</span>
      </div>
    </div>
  </div>

  <div class="project-card">
    <div class="project-header">
      <div class="project-title">🏔️ 山西旅游 Agent</div>
      <div class="project-links">
        <a href="#">GitHub</a>
      </div>
    </div>
    <div class="project-body">
      <p class="project-description">智能旅游助手，为山西旅游提供个性化推荐和行程规划。</p>
      <div class="project-tech">
        <span class="tech-badge">AI Agent</span>
        <span class="tech-badge">RAG</span>
        <span class="tech-badge">旅游</span>
      </div>
    </div>
  </div>

  <div class="project-card">
    <div class="project-header">
      <div class="project-title">✅ 待办管理平台</div>
      <div class="project-links">
        <a href="#">GitHub</a>
      </div>
    </div>
    <div class="project-body">
      <p class="project-description">跨平台待办事项管理应用，支持多设备同步。</p>
      <div class="project-tech">
        <span class="tech-badge">Capacitor</span>
        <span class="tech-badge">跨平台</span>
        <span class="tech-badge">移动应用</span>
      </div>
    </div>
  </div>

  <div class="project-card">
    <div class="project-header">
      <div class="project-title">🎮 梗图匹配游戏</div>
      <div class="project-links">
        <a href="#">GitHub</a>
      </div>
    </div>
    <div class="project-body">
      <p class="project-description">有趣的梗图匹配小游戏，休闲娱乐。</p>
      <div class="project-tech">
        <span class="tech-badge">游戏</span>
        <span class="tech-badge">Web</span>
        <span class="tech-badge">趣味</span>
      </div>
    </div>
  </div>

  <div class="project-card">
    <div class="project-header">
      <div class="project-title">📊 简易记账</div>
      <div class="project-links">
        <a href="#">GitHub</a>
      </div>
    </div>
    <div class="project-body">
      <p class="project-description">简单易用的个人记账应用，帮助管理日常开支。</p>
      <div class="project-tech">
        <span class="tech-badge">记账</span>
        <span class="tech-badge">财务</span>
        <span class="tech-badge">工具</span>
      </div>
    </div>
  </div>
</div>
