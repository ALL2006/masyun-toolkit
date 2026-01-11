---
layout: page
title: 首页
---

<style>
  .hero {
    text-align: center;
    padding: 4rem 0;
  }

  .hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero .tagline {
    font-size: 1.3rem;
    color: #718096;
    margin-bottom: 2rem;
  }

  .hero .cta {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.8rem 2rem;
    border-radius: 30px;
    text-decoration: none;
    font-weight: bold;
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .hero .cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin: 4rem 0;
  }

  .feature-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    transition: transform 0.3s;
  }

  .feature-card:hover {
    transform: translateY(-5px);
  }

  .feature-card .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    margin-bottom: 0.5rem;
    color: #2d3748;
  }

  .feature-card p {
    color: #718096;
  }

  .latest-posts {
    margin: 4rem 0;
  }

  .latest-posts h2 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 2rem;
    color: #2d3748;
  }

  .post-list {
    list-style: none;
  }

  .post-item {
    background: white;
    padding: 1.5rem;
    margin-bottom: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    transition: box-shadow 0.3s;
  }

  .post-item:hover {
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  .post-item a {
    text-decoration: none;
    color: inherit;
  }

  .post-item h3 {
    margin-bottom: 0.5rem;
    color: #2d3748;
  }

  .post-item .date {
    color: #a0aec0;
    font-size: 0.9rem;
  }
</style>

<div class="hero">
  <h1>欢迎来到我的技术空间</h1>
  <p class="tagline">探索技术边界，分享实战经验</p>
  <a href="/blog/" class="cta">开始阅读</a>
</div>

<div class="features">
  <div class="feature-card">
    <div class="icon">📖</div>
    <h3>技术文章</h3>
    <p>分享 AI、RAG、全栈开发等技术经验</p>
  </div>
  <div class="feature-card">
    <div class="icon">🚀</div>
    <h3>项目实战</h3>
    <p>展示个人项目，记录开发历程</p>
  </div>
  <div class="feature-card">
    <div class="icon">💡</div>
    <h3>技术洞察</h3>
    <p>深度思考，探索技术本质</p>
  </div>
</div>

<div class="latest-posts">
  <h2>最新文章</h2>
  <ul class="post-list">
    {% for post in site.posts limit:5 %}
    <li class="post-item">
      <a href="{{ post.url }}">
        <h3>{{ post.title }}</h3>
        <span class="date">{{ post.date | date: '%Y年%m月%d日' }}</span>
      </a>
    </li>
    {% endfor %}
  </ul>
</div>
