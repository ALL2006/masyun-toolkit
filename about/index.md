---
layout: page
title: 关于我
---

<style>
  .about-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .intro {
    text-align: center;
    margin-bottom: 3rem;
  }

  .intro h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #2d3748;
  }

  .intro p {
    color: #718096;
    font-size: 1.1rem;
  }

  .section {
    margin-bottom: 3rem;
  }

  .section h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #4a5568;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .tech-category h4 {
    color: #667eea;
    margin-bottom: 0.5rem;
  }

  .tech-list {
    list-style: none;
  }

  .tech-list li {
    padding: 0.3rem 0;
    color: #4a5568;
  }

  .contact {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  }

  .contact a {
    display: inline-block;
    margin: 0.5rem;
    padding: 0.8rem 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-decoration: none;
    border-radius: 25px;
    transition: transform 0.3s;
  }

  .contact a:hover {
    transform: translateY(-2px);
  }

  .quote {
    text-align: center;
    margin-top: 3rem;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    font-style: italic;
    font-size: 1.2rem;
  }
</style>

<div class="about-content">
  <div class="intro">
    <h2>你好，我是郝彬珺 👋</h2>
    <p>一名专注于 AI应用开发 和 全栈技术 的开发者</p>
  </div>

  <div class="section">
    <h3>🎯 关于我</h3>
    <p>我热衷于探索前沿技术，特别是 RAG 检索增强生成系统、多模态 AI 应用、微服务架构设计和跨平台应用开发。我相信技术可以改变生活，用代码创造价值是我的追求。</p>
  </div>

  <div class="section">
    <h3>💻 技术栈</h3>
    <div class="tech-grid">
      <div class="tech-category">
        <h4>后端</h4>
        <ul class="tech-list">
          <li>Java (Spring Boot, 微服务)</li>
          <li>Python (FastAPI, AI/ML)</li>
          <li>Node.js (全栈开发)</li>
        </ul>
      </div>
      <div class="tech-category">
        <h4>前端</h4>
        <ul class="tech-list">
          <li>Vue.js</li>
          <li>React</li>
          <li>Capacitor, Electron</li>
        </ul>
      </div>
      <div class="tech-category">
        <h4>AI/ML</h4>
        <ul class="tech-list">
          <li>RAG 系统</li>
          <li>Prompt 工程</li>
          <li>CLIP, Whisper</li>
        </ul>
      </div>
      <div class="tech-category">
        <h4>数据库/中间件</h4>
        <ul class="tech-list">
          <li>MySQL, PostgreSQL</li>
          <li>Redis, ChromaDB</li>
          <li>RabbitMQ, Elasticsearch</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="section">
    <h3>🏆 项目经验</h3>
    <ul>
      <li><strong>masyun-toolkit</strong> - AI 编程项目分享工具</li>
      <li><strong>fengshui-ai</strong> - 风水 AI 分析系统</li>
      <li><strong>shanxi-tourism-agent</strong> - 山西旅游智能 Agent</li>
      <li><strong>todo-management-platform</strong> - 跨平台待办管理应用</li>
    </ul>
  </div>

  <div class="section">
    <h3>🎓 比赛经历</h3>
    <ul>
      <li>三创AI电商实战赛</li>
      <li>梧桐杯创新大赛</li>
    </ul>
  </div>

  <div class="contact">
    <h3>📬 联系方式</h3>
    <a href="https://gitee.com/haobinjun" target="_blank">Gitee</a>
    <a href="https://github.com/ALL2006" target="_blank">GitHub</a>
  </div>

  <div class="quote">
    "用技术创造价值，用分享传递知识"
  </div>
</div>
