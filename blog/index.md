---
layout: page
title: 博客文章
---

<style>
  .blog-list {
    max-width: 800px;
    margin: 0 auto;
  }

  .post-card {
    background: white;
    padding: 2rem;
    margin-bottom: 2rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .post-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
  }

  .post-card a {
    text-decoration: none;
    color: inherit;
  }

  .post-title {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: #2d3748;
  }

  .post-meta {
    color: #a0aec0;
    font-size: 0.9rem;
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .post-excerpt {
    color: #4a5568;
    line-height: 1.6;
  }

  .post-tags {
    margin-top: 1rem;
  }

  .tag {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.2rem 0.6rem;
    border-radius: 15px;
    font-size: 0.8rem;
    margin-right: 0.5rem;
  }

  .pagination {
    text-align: center;
    margin-top: 3rem;
  }

  .pagination a, .pagination span {
    display: inline-block;
    padding: 0.5rem 1rem;
    margin: 0 0.3rem;
    border-radius: 5px;
    text-decoration: none;
  }

  .pagination a {
    background: white;
    color: #667eea;
    border: 1px solid #e2e8f0;
  }

  .pagination a:hover {
    background: #667eea;
    color: white;
  }

  .pagination .current {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
</style>

<div class="blog-list">
  {% for post in paginator.posts %}
  <article class="post-card">
    <a href="{{ post.url }}">
      <h2 class="post-title">{{ post.title }}</h2>
      <div class="post-meta">
        <span>📅 {{ post.date | date: '%Y年%m月%d日' }}</span>
        {% if post.categories %}
        <span>📁 {{ post.categories | join: ', ' }}</span>
        {% endif %}
      </div>
      <p class="post-excerpt">{{ post.excerpt | strip_html | truncate: 200 }}</p>
      {% if post.tags %}
      <div class="post-tags">
        {% for tag in post.tags %}
        <span class="tag">{{ tag }}</span>
        {% endfor %}
      </div>
      {% endif %}
    </a>
  </article>
  {% endfor %}

  <div class="pagination">
    {% if paginator.previous_page %}
    <a href="{{ paginator.previous_page_path }}">« 上一页</a>
    {% endif %}

    {% for page in (1..paginator.total_pages) %}
    {% if page == paginator.page %}
    <span class="current">{{ page }}</span>
    {% elsif page == 1 %}
    <a href="/blog/">1</a>
    {% else %}
    <a href="/blog/page{{ page }}/">{{ page }}</a>
    {% endif %}
    {% endfor %}

    {% if paginator.next_page %}
    <a href="{{ paginator.next_page_path }}">下一页 »</a>
    {% endif %}
  </div>
</div>
