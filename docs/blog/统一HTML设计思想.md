# 统一HTML设计思想

> 全屏卡片式 + GSAP动画控制 + 短视频创作工作流的整合设计

---

## 一、设计概述

### 1.1 设计理念

本设计整合了**全屏卡片式布局**、**GSAP专业动画控制**和**短视频创作工作流**的核心优势，形成一个统一的HTML可视化演示方案：

| 特性来源 | 特性名称 | 实现方式 |
|----------|----------|----------|
| 全屏卡片式 | 数据流背景 | Canvas 15条彩色线条流动 |
| 全屏卡片式 | 毛玻璃导航 | `backdrop-filter: blur(10px)` |
| 全屏卡片式 | 全屏卡片 | 每步一屏，淡入淡出切换 |
| 动画可视化 | GSAP控制 | Label + tweenTo精确控制 |
| 动画可视化 | 速度调节 | 0.5x / 1x / 1.5x |
| 短视频工作流 | 代码浮窗 | 可收起的代码展示面板 |

### 1.2 核心特性

- **动态背景**：科技感数据流瀑布，营造未来感
- **全屏卡片**：每步内容占据整个屏幕，更聚焦
- **专业动画**：GSAP timeline精确控制，支持暂停/回退/变速
- **优雅切换**：淡入淡出动画，毛玻璃效果
- **工作流整合**：标准化5部分内容输出

### 1.3 适用场景

- **技术原理演示**：适合复杂概念的逐步讲解
- **短视频录制**：配合口播录制技术视频
- **产品展示**：沉浸式产品功能介绍
- **教学课件**：课堂演示和在线课程

---

## 二、视觉设计系统

### 2.1 配色方案（GitHub Dark）

```css
/* 背景层级 */
--bg-primary:   #0d1117;   /* 主背景 */
--bg-secondary: #161b22;   /* 次要背景 */
--bg-tertiary:  #21262d;   /* 输入框/高亮 */
--bg-active:    #30363d;   /* 悬停/激活 */

/* 文字颜色 */
--text-primary:   #e6edf3;  /* 主要文字 */
--text-secondary: #8b949e;  /* 次要文字 */
--text-muted:     #6e7681;  /* 弱化文字 */

/* 强调色 */
--accent-blue:   #58a6ff;  /* 科技蓝 */
--accent-green:  #3fb950;  /* 霓虹绿 */
--accent-purple: #a371f7;  /* 紫色 */

/* 语法高亮 */
--syntax-keyword:  #ff7b72;  /* public, return, if */
--syntax-string:   #a5d6ff;  /* "字符串" */
--syntax-comment:  #8b949e;  // 注释
--syntax-class:    #d2a8ff;  /* UserService */
--syntax-function: #d2a8ff;  /* findById() */
--syntax-number:   #79c0ff;  /* 123, 3.14 */
```

### 2.2 数据流背景规范

#### 视觉效果
- **效果**：彩色线条从上往下流动，类似《黑客帝国》但更柔和
- **密度**：适中（同时存在约15条线条）
- **速度**：每条线条速度随机（2-5像素/帧）
- **透明度**：30%，确保不影响内容阅读

#### 配置参数

```javascript
const DATA_STREAM_CONFIG = {
    lineCount: 15,           // 同时存在的线条数
    speed: {
        min: 2,              // 最小速度
        max: 5               // 最大速度
    },
    colors: [
        '#58a6ff',           // 科技蓝
        '#3fb950',           // 霓虹绿
        '#a371f7'            // 紫色
    ],
    opacity: 0.3,            // 全局透明度
    width: {
        min: 1,              // 最小线宽
        max: 3               // 最大线宽
    },
    length: {
        min: 50,             // 最小长度
        max: 200             // 最大长度
    }
};
```

#### 性能优化

```javascript
// 低性能设备降级方案
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // 禁用动画
    DATA_STREAM_CONFIG.lineCount = 0;
} else if (isLowPerformanceDevice()) {
    // 减少线条数量
    DATA_STREAM_CONFIG.lineCount = 5;
}
```

### 2.3 毛玻璃效果规范

#### 侧边导航栏

```css
.glass-nav {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 220px;
    z-index: 100;

    /* 毛玻璃效果 */
    background: rgba(22, 27, 34, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);

    /* 边框 */
    border-right: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### 代码浮窗

```css
.code-float {
    position: absolute;
    right: 40px;
    bottom: 120px;
    width: 400px;
    max-height: 60vh;
    overflow-y: auto;

    /* 毛玻璃效果 */
    background: rgba(13, 17, 23, 0.9);
    backdrop-filter: blur(10px);

    /* 边框和圆角 */
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    /* 切换动画 */
    transform: translateX(0);
    transition: transform 0.3s ease;
}

.code-float.collapsed {
    transform: translateX(calc(100% + 20px));
}
```

### 2.4 卡片样式规范

#### 全屏卡片容器

```css
.step-card {
    position: absolute;
    inset: 0;
    z-index: 50;

    /* Flex 居中布局 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    /* 初始状态 */
    opacity: 0;
    visibility: hidden;

    /* 淡入淡出动画 */
    transition: opacity 0.3s ease, visibility 0.3s;
}

.step-card.active {
    opacity: 1;
    visibility: visible;
}
```

---

## 三、布局结构

### 3.1 页面层级（z-index）

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 0: 数据流背景层 (z-index: 0)                          │
│  └── Canvas 全屏覆盖                                        │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: 全屏内容卡片层 (z-index: 50)                       │
│  └── 当前显示的步骤卡片                                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: 毛玻璃侧边导航 (z-index: 100)                      │
│  └── 固定在左侧，半透明                                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: 底部控制栏 (z-index: 200)                          │
│  └── 固定在底部，控制按钮和跳转                              │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 布局示意图

```
┌─────────────────────────────────────────────────────────────────┐
│                    数据流背景层（Canvas）                        │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────────────────────────────────────────┐ │
│ │          │ │                                              │ │
│ │  毛      │ │         ┌────────────────────┐              │ │
│ │  璃      │ │         │                    │              │ │
│ │  导      │ │         │    SVG 动画画布    │              │ │
│ │  航      │ │         │      (居中)        │              │ │
│ │          │ │         │                    │              │ │
│ │ ● 模块1  │ │         └────────────────────┘              │ │
│ │   模块2  │ │                                              │ │
│ │   模块3  │ │         [步骤标题和说明]                     │ │
│ └──────────┘ │                                              │ │
│              │              ┌─────────┐                     │ │
│              │              │ 代码浮窗│ (可收起)            │ │
│              │              └─────────┘                     │ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 四、GSAP动画控制（核心）

### 4.1 分步控制原理

> **重要**：这是实现分步播放动画的核心经验，必须严格遵循

#### 常见错误：直接使用 play()

```javascript
// ❌ 错误做法：点击一次会播放所有动画
nextStep() {
    if (this.currentStep < totalSteps) {
        this.currentStep++;
        tl.play();  // 问题：会一直播放到timeline结束！
    }
}
```

#### 正确做法：使用 Label + tweenTo()

**步骤1：创建 Timeline 时添加 Label 标记**

```javascript
initModule1() {
    const tl = gsap.timeline({ paused: true });

    // 在每个步骤完成后添加 label
    tl.add('step0');  // 初始状态

    // 步骤1的动画
    tl.to('#element1', { opacity: 1, duration: 0.5 });
    tl.add('step1');  // 标记步骤1结束位置

    // 步骤2的动画
    tl.to('#element2', { opacity: 1, duration: 0.5 });
    tl.add('step2');  // 标记步骤2结束位置

    // 步骤3的动画
    tl.to('#element3', { opacity: 1, duration: 0.5 });
    tl.add('step3');  // 标记步骤3结束位置

    timelines[1] = tl;
    this.currentStep[1] = 0;
}
```

**步骤2：使用 tweenTo() 控制播放**

```javascript
nextStep() {
    const module = this.currentModule;
    const tl = timelines[module];
    const totalSteps = modules[module].steps;

    if (this.currentStep[module] < totalSteps && !this.isAnimating) {
        this.isAnimating = true;
        this.currentStep[module]++;

        // 播放到目标 label 位置
        const targetLabel = `step${this.currentStep[module]}`;
        tl.tweenTo(targetLabel, {
            onComplete: () => {
                tl.pause();           // 关键：确保在目标位置暂停
                this.isAnimating = false;
            }
        });

        this.showExplanation(module, this.currentStep[module] - 1);
    }

    this.updateProgress();
}

prevStep() {
    const module = this.currentModule;
    if (this.currentStep[module] > 0 && !this.isAnimating) {
        this.isAnimating = true;
        this.currentStep[module]--;

        // 回退到目标 label 位置
        const targetLabel = `step${this.currentStep[module]}`;
        timelines[module].tweenTo(targetLabel, {
            onComplete: () => {
                timelines[module].pause();
                this.isAnimating = false;
            }
        });

        this.showExplanation(module, this.currentStep[module]);
    }

    this.updateProgress();
}
```

**步骤3：重置使用 seek()**

```javascript
reset() {
    const module = this.currentModule;
    this.currentStep[module] = 0;

    // 直接跳转到初始位置
    timelines[module].seek('step0');
    timelines[module].pause();

    this.showExplanation(module, 0);
    this.updateProgress();
}
```

### 4.2 核心要点总结

| 要点 | 说明 |
|------|------|
| **Label 标记** | 每个步骤结束时添加 `tl.add('stepN')` 标记位置 |
| **tweenTo 控制** | 使用 `tl.tweenTo(label)` 精确播放到指定位置 |
| **暂停确保** | 在 `onComplete` 中调用 `tl.pause()` 确保停止 |
| **防重复触发** | 使用 `isAnimating` 标志防止快速点击 |
| **重置方法** | 使用 `tl.seek('step0')` 而不是 `tl.restart()` |

### 4.3 速度控制

```javascript
const speeds = {
    slow: 0.5,      // 慢速 - 适合细致讲解
    normal: 1,      // 正常 - 默认速度
    fast: 1.5       // 快速 - 快速预览
};

function setSpeed(speed) {
    state.speed = speed;
    currentTimeline.timeScale(speeds[speed]);
}
```

---

## 五、HTML模板

### 5.1 完整结构示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[主题名称] - 可视化演示</title>
    <!-- GSAP CDN -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>

    <style>
        /* CSS Variables - GitHub Dark配色 */
        :root {
            --bg-primary: #0d1117;
            --bg-secondary: #161b22;
            --text-primary: #e6edf3;
            --text-secondary: #8b949e;
            --accent-blue: #58a6ff;
            --accent-green: #3fb950;
            --accent-purple: #a371f7;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            overflow: hidden;
            height: 100vh;
        }

        /* 数据流背景 (Layer 0) */
        .data-stream-bg {
            position: fixed;
            inset: 0;
            z-index: 0;
            pointer-events: none;
        }

        /* 全屏卡片容器 (Layer 1) */
        .cards-container {
            position: relative;
            margin-left: 220px;
            height: calc(100vh - 60px);
            overflow: hidden;
        }

        .step-card {
            position: absolute;
            inset: 0;
            z-index: 50;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s;
            padding: 40px;
        }

        .step-card.active {
            opacity: 1;
            visibility: visible;
        }

        .card-content {
            position: relative;
            width: 100%;
            max-width: 1200px;
            padding: 40px;
            background: rgba(13, 17, 23, 0.5);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            text-align: center;
        }

        /* 毛玻璃导航 (Layer 2) */
        .glass-nav {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 220px;
            z-index: 100;
            background: rgba(22, 27, 34, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
            padding: 20px 0;
            display: flex;
            flex-direction: column;
        }

        .nav-header {
            padding: 0 20px 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-header h2 {
            font-size: 14px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .nav-items {
            flex: 1;
            overflow-y: auto;
        }

        .nav-item {
            padding: 12px 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--text-secondary);
            transition: all 0.2s;
            border-left: 3px solid transparent;
        }

        .nav-item:hover {
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-primary);
        }

        .nav-item.active {
            background: rgba(88, 166, 255, 0.1);
            color: var(--accent-blue);
            border-left-color: var(--accent-blue);
        }

        .nav-item .icon {
            font-weight: bold;
            opacity: 0.7;
        }

        /* 底部控制栏 (Layer 3) */
        .control-bar {
            position: fixed;
            bottom: 0;
            left: 220px;
            right: 0;
            z-index: 200;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 24px;
            background: rgba(22, 27, 34, 0.9);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            gap: 20px;
        }

        .control-group {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .control-btn, .tool-btn {
            padding: 8px 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-primary);
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
        }

        .control-btn:hover, .tool-btn:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-1px);
        }

        .control-btn.primary {
            background: var(--accent-blue);
            border-color: var(--accent-blue);
            color: white;
        }

        .control-btn.primary:hover {
            background: #4c8ed6;
        }

        /* 步骤进度 */
        .step-dots {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .step-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--bg-active);
        }

        .step-dot.active {
            background: var(--accent-blue);
        }

        .step-dot.completed {
            background: var(--accent-green);
        }

        .step-separator {
            color: var(--bg-active);
            font-size: 10px;
        }

        .step-number {
            color: var(--text-secondary);
            font-size: 12px;
            min-width: 60px;
            text-align: center;
        }

        /* 代码浮窗 */
        .code-float {
            position: absolute;
            right: 40px;
            bottom: 120px;
            width: 400px;
            max-height: 60vh;
            overflow-y: auto;
            background: rgba(13, 17, 23, 0.9);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transform: translateX(0);
            transition: transform 0.3s ease;
            z-index: 60;
        }

        .code-float.collapsed {
            transform: translateX(calc(100% + 20px));
        }

        .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 12px;
            color: var(--text-secondary);
        }

        .code-header button {
            background: none;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 16px;
        }

        .code-header button:hover {
            color: var(--text-primary);
        }

        .code-content {
            padding: 15px;
            font-size: 12px;
            line-height: 1.6;
            overflow-x: auto;
        }

        .code-content pre {
            margin: 0;
            color: var(--text-primary);
        }

        /* 动画画布 */
        .animation-canvas {
            width: 100%;
            max-width: 800px;
            height: auto;
            margin: 20px 0;
        }

        /* 响应式 */
        @media (max-width: 768px) {
            .glass-nav {
                transform: translateX(-100%);
                transition: transform 0.3s ease;
            }
            .glass-nav.open { transform: translateX(0); }
            .code-float {
                width: 100%;
                left: 0;
                right: 0;
                bottom: 0;
                border-radius: 16px 16px 0 0;
                transform: translateY(100%);
            }
            .code-float.collapsed { transform: translateY(100%); }
            .control-bar {
                flex-wrap: wrap;
                padding: 8px;
            }
            .step-dots { display: none; }
        }
    </style>
</head>
<body>
    <!-- Layer 0: 数据流背景 -->
    <canvas id="dataStreamCanvas" class="data-stream-bg"></canvas>

    <!-- Layer 2: 毛玻璃导航 -->
    <nav class="glass-nav">
        <div class="nav-header">
            <h2>模块</h2>
        </div>
        <div class="nav-items">
            <div class="nav-item active" data-module="1" onclick="switchModule(1)">
                <span class="icon">1.</span>
                <span>模块1名称</span>
            </div>
            <div class="nav-item" data-module="2" onclick="switchModule(2)">
                <span class="icon">2.</span>
                <span>模块2名称</span>
            </div>
            <div class="nav-item" data-module="3" onclick="switchModule(3)">
                <span class="icon">3.</span>
                <span>模块3名称</span>
            </div>
        </div>
    </nav>

    <!-- Layer 1: 全屏卡片容器 -->
    <main class="cards-container">
        <!-- 步骤1卡片 -->
        <section class="step-card active" data-step="1" data-module="1">
            <div class="card-content">
                <h2>步骤标题</h2>
                <p class="description">步骤描述</p>

                <svg class="animation-canvas" viewBox="0 0 800 400">
                    <!-- SVG内容 + GSAP动画 -->
                </svg>
            </div>

            <!-- 代码浮窗 -->
            <div class="code-float" id="codeFloat1">
                <div class="code-header">
                    <span>代码</span>
                    <button onclick="toggleCode()">×</button>
                </div>
                <div class="code-content">
                    <pre><code>代码内容</code></pre>
                </div>
            </div>
        </section>

        <!-- 步骤2卡片 -->
        <section class="step-card" data-step="2" data-module="1">
            <div class="card-content">
                <h2>步骤2标题</h2>
                <p class="description">步骤2描述</p>

                <svg class="animation-canvas" viewBox="0 0 800 400">
                    <!-- SVG内容 -->
                </svg>
            </div>

            <div class="code-float collapsed">
                <div class="code-header">
                    <span>代码</span>
                    <button onclick="toggleCode()">×</button>
                </div>
                <div class="code-content">
                    <pre><code>步骤2代码</code></pre>
                </div>
            </div>
        </section>

        <!-- 更多步骤卡片... -->
    </main>

    <!-- Layer 3: 底部控制栏 -->
    <footer class="control-bar">
        <div class="control-group">
            <button class="control-btn" onclick="prevStep()">◀ 上一步</button>
            <button class="control-btn primary" onclick="nextStep()">下一步 ▶</button>
        </div>

        <div class="control-group">
            <div class="step-dots" id="stepDots"></div>
            <div class="step-number" id="stepNumber">1 / 8</div>
        </div>

        <div class="control-group">
            <button class="tool-btn" onclick="setSpeed(0.5)">0.5x</button>
            <button class="tool-btn active" onclick="setSpeed(1)">1x</button>
            <button class="tool-btn" onclick="setSpeed(1.5)">1.5x</button>
        </div>

        <div class="control-group tools">
            <button class="tool-btn" onclick="toggleCode()">代码</button>
            <button class="tool-btn" onclick="toggleFullscreen()">⛶</button>
        </div>
    </footer>

    <script>
        // ===== 全局状态 =====
        const state = {
            currentModule: 1,
            currentStep: 1,
            isAnimating: false,
            speed: 1,
            modules: {
                1: { name: '模块1', startStep: 1, endStep: 3 },
                2: { name: '模块2', startStep: 4, endStep: 6 },
                3: { name: '模块3', startStep: 7, endStep: 8 }
            }
        };

        const totalSteps = 8;
        const timelines = {};

        // ===== Layer 0: 数据流背景 =====
        class DataStreamBackground {
            constructor(canvasId) {
                this.canvas = document.getElementById(canvasId);
                this.ctx = this.canvas.getContext('2d');
                this.lines = [];

                this.config = {
                    lineCount: 15,
                    speed: { min: 2, max: 5 },
                    colors: ['#58a6ff', '#3fb950', '#a371f7'],
                    opacity: 0.3,
                    width: { min: 1, max: 3 },
                    length: { min: 50, max: 200 }
                };

                this.init();
            }

            init() {
                this.resize();
                window.addEventListener('resize', () => this.resize());
                this.createLines();
                this.animate();
            }

            resize() {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }

            createLines() {
                for (let i = 0; i < this.config.lineCount; i++) {
                    this.lines.push(this.newLine(true));
                }
            }

            newLine(randomY = false) {
                return {
                    x: Math.random() * this.canvas.width,
                    y: randomY ? Math.random() * this.canvas.height : -this.config.length.max - Math.random() * 100,
                    speed: this.config.speed.min + Math.random() * (this.config.speed.max - this.config.speed.min),
                    color: this.config.colors[Math.floor(Math.random() * this.config.colors.length)],
                    width: this.config.width.min + Math.random() * (this.config.width.max - this.config.width.min),
                    length: this.config.length.min + Math.random() * (this.config.length.max - this.config.length.min)
                };
            }

            draw() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                this.lines.forEach(line => {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = line.color;
                    this.ctx.globalAlpha = this.config.opacity;
                    this.ctx.lineWidth = line.width;
                    this.ctx.lineCap = 'round';

                    this.ctx.moveTo(line.x, line.y);
                    this.ctx.lineTo(line.x, line.y + line.length);
                    this.ctx.stroke();

                    line.y += line.speed;

                    if (line.y > this.canvas.height) {
                        Object.assign(line, this.newLine());
                    }
                });

                requestAnimationFrame(() => this.draw());
            }

            animate() {
                this.draw();
            }
        }

        // ===== GSAP Timeline控制（核心） =====
        function initModule1() {
            const tl = gsap.timeline({ paused: true });

            // 关键：添加label标记
            tl.add('step0');

            // 步骤1动画
            tl.to('#element1', { opacity: 1, duration: 0.5 });
            tl.add('step1');

            // 步骤2动画
            tl.to('#element2', { x: 100, duration: 0.5 });
            tl.add('step2');

            timelines[1] = tl;
        }

        // ===== 分步控制 =====
        function nextStep() {
            const module = state.currentModule;
            const tl = timelines[module];

            if (state.currentStep < totalSteps && !state.isAnimating) {
                state.isAnimating = true;
                state.currentStep++;

                // 使用tweenTo精确控制
                const targetLabel = `step${state.currentStep}`;
                tl.tweenTo(targetLabel, {
                    duration: 0.5 / state.speed,
                    onComplete: () => {
                        tl.pause();
                        state.isAnimating = false;
                    }
                });

                showStep(state.currentStep);
                updateProgress();
            }
        }

        function prevStep() {
            const module = state.currentModule;

            if (state.currentStep > 1 && !state.isAnimating) {
                state.isAnimating = true;
                state.currentStep--;

                const targetLabel = `step${state.currentStep}`;
                timelines[module].tweenTo(targetLabel, {
                    duration: 0.5 / state.speed,
                    onComplete: () => {
                        timelines[module].pause();
                        state.isAnimating = false;
                    }
                });

                showStep(state.currentStep);
                updateProgress();
            }
        }

        // ===== 卡片切换 =====
        function showStep(stepId) {
            const cards = document.querySelectorAll('.step-card');
            cards.forEach(card => {
                const isActive = parseInt(card.dataset.step) === stepId;
                card.classList.toggle('active', isActive);
            });
        }

        // ===== 模块切换 =====
        function switchModule(moduleNum) {
            if (moduleNum === state.currentModule) return;

            // 更新导航状态
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active',
                    parseInt(item.dataset.module) === moduleNum);
            });

            // 跳转到模块的第一步
            const firstStep = state.modules[moduleNum].startStep;
            state.currentStep = firstStep;
            showStep(firstStep);
            updateProgress();

            state.currentModule = moduleNum;
        }

        // ===== 速度控制 =====
        function setSpeed(speed) {
            state.speed = speed;
            Object.values(timelines).forEach(tl => {
                tl.timeScale(speed);
            });

            // 更新按钮状态
            document.querySelectorAll('.control-group .tool-btn').forEach(btn => {
                if (btn.textContent.includes(speed + 'x')) {
                    btn.classList.add('active');
                } else if (btn.textContent.includes('x')) {
                    btn.classList.remove('active');
                }
            });
        }

        // ===== 进度更新 =====
        function updateProgress() {
            const dotsContainer = document.getElementById('stepDots');
            dotsContainer.innerHTML = '';

            for (let i = 1; i <= totalSteps; i++) {
                const dot = document.createElement('span');
                dot.className = 'step-dot';
                if (i < state.currentStep) dot.classList.add('completed');
                if (i === state.currentStep) dot.classList.add('active');
                dotsContainer.appendChild(dot);

                if (i < totalSteps) {
                    const sep = document.createElement('span');
                    sep.className = 'step-separator';
                    sep.textContent = '─';
                    dotsContainer.appendChild(sep);
                }
            }

            document.getElementById('stepNumber').textContent = `${state.currentStep} / ${totalSteps}`;
        }

        // ===== 辅助函数 =====
        function toggleCode() {
            const codeFloat = document.querySelector('.step-card.active .code-float');
            if (codeFloat) {
                codeFloat.classList.toggle('collapsed');
            }
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }

        // ===== 初始化 =====
        document.addEventListener('DOMContentLoaded', () => {
            // 启动数据流背景
            new DataStreamBackground('dataStreamCanvas');

            // 初始化模块
            initModule1();

            // 显示第一步
            showStep(1);
            updateProgress();

            // 键盘快捷键
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === ' ') {
                    e.preventDefault();
                    nextStep();
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    prevStep();
                } else if (e.key >= '1' && e.key <= '9') {
                    const moduleNum = parseInt(e.key);
                    if (state.modules[moduleNum]) {
                        switchModule(moduleNum);
                    }
                }
            });
        });
    </script>
</body>
</html>
```

---

## 六、内容创作工作流

### 6.1 输出内容规范

每次创作任务需要输出以下5部分内容：

```
┌─────────────────────────────────────────────────────────┐
│                    创作内容输出                          │
├─────────────────────────────────────────────────────────┤
│  第一部分：口播文案（用于录制配音）                      │
│  第二部分：HTML 可视化演示网页（用于录制画面）           │
│  第三部分：短视频简介（用于发布平台）                    │
│  第四部分：技术文章（用于自媒体发布）                    │
│  第五部分：AI生成提示词（封面设计，3种比例）              │
└─────────────────────────────────────────────────────────┘
```

### 6.2 文件组织结构

```
D:\抖音创作\
├── [主题名称]\
│   ├── 01-可视化演示.html        # 统一的HTML文件
│   ├── 02-口播文案.md            # 带时间轴的录制脚本
│   ├── 03-短视频简介.md          # 多平台发布简介
│   ├── 04-技术文章.md            # 技术博客文章
│   └── 05-AI生成提示词.md        # 3种比例的封面设计提示词
```

### 6.3 用户发起任务

```
@AI，请帮我创作一个关于[主题]的内容，需要:
1. 口播文案（带时间轴）
2. HTML可视化演示网页（全屏卡片式 + GSAP控制 + 数据流背景）
3. 短视频简介（多版本）
4. 技术文章（系统讲解）
5. AI生成提示词（3种比例封面）

主题要求: [具体描述]
目标受众: [初学者/进阶/高级]
视频时长: [预计时长]
```

### 6.4 AI响应流程

```
1. 确认理解主题、目标受众、时长要求
2. 规划内容:
   - 拆解知识点（2-5个模块）
   - 设计步骤（每模块3-8步）
3. 输出5部分内容:
   - 02-口播文案.md
   - 01-可视化演示.html
   - 03-短视频简介.md
   - 04-技术文章.md
   - 05-AI生成提示词.md
```

### 6.5 用户使用流程

```
1. 复制口播文案 → 录制配音
2. 打开HTML演示 → 配合配音录制画面
   - 使用上一步/下一步控制节奏
   - 调整速度(0.5x/1x/1.5x)适应讲解
   - 代码浮窗展示关键代码
3. 复制短视频简介 → 发布时使用
4. 发布技术文章 → 博客平台
5. 复制AI生成提示词 → 生成封面图片
```

---

## 七、配套文件规范

### 7.1 口播文案格式

```markdown
## 口播文案

### 标题
[视频标题]

### 时长预估
约 XX 秒

### 文案内容
[00:00 - 00:05] 开场白
大家好，我是[你的名字]。今天我们来聊一聊[主题]。

[00:05 - XX:XX] 核心讲解
（此处与动画步骤同步）
```

### 7.2 短视频简介格式

```markdown
## 短视频简介

### 标题建议
[15-25字吸引眼球的标题]

### 简介
【抖音/快手风格】
搞懂[主题]，这一篇就够了！
#编程 #技术分享

【B站/视频号风格】
视频讲解[主题]的核心原理...
```

### 7.3 技术文章格式

```markdown
# 文章标题

## 开篇引入
...

## 核心概念讲解
...

## 实际应用
...

## 总结
---

## 相关项目
**项目仓库**：
- GitHub: https://github.com/[用户名]/[仓库名]
- Gitee: https://gitee.com/[用户名]/[仓库名]

**配套资源**：
- 可视化演示：[说明]
- 视频教程：已在同名账号发布到以下平台
  - 📺 抖音：搜索"架构狮与橘"
  - 📺 快手：搜索"架构狮与橘"
  - 📺 哔哩哔哩：搜索"架构狮与橘"
```

### 7.4 AI生成提示词格式

```markdown
# [主题名称]封面 - AI生成提示词

## 主题说明
**文章标题**: [标题]
**核心概念**: [关键词]

---

## 🎯 一键生成: 3种比例提示词

### 中文详细版（专为豆包等中文AI优化）
[超级详细的中文提示词，包含8大要素]

---

## 📐 各比例详细提示词

### 比例1: 16:9（横版）
### 比例2: 4:3（标准）
### 比例3: 3:4（竖版）
```

---

## 八、交互设计

### 8.1 核心控制

| 操作 | 按键 | 功能 |
|------|------|------|
| 上一步 | ← / 点击按钮 | 回到上一步动画 |
| 下一步 | → / 空格 / 点击按钮 | 播放下一步 |
| 重置 | R / 点击按钮 | 回到初始状态 |
| 速度调节 | 1/2/3 或下拉选择 | 0.5x / 1x / 1.5x |
| 模块跳转 | 数字键 1-9 / 点击导航 | 跳转到指定模块 |
| 全屏 | F / 点击按钮 | 进入/退出全屏 |

### 8.2 键盘快捷键

```javascript
document.addEventListener('keydown', (e) => {
    // 步骤导航
    if (e.key === 'ArrowRight' || e.key === ' ') {
        nextStep();
    }
    if (e.key === 'ArrowLeft') {
        prevStep();
    }

    // 模块导航 (数字键 1-9)
    if (e.key >= '1' && e.key <= '9') {
        const moduleNum = parseInt(e.key);
        switchModule(moduleNum);
    }

    // 代码浮窗
    if (e.key === 'c' || e.key === 'C') {
        toggleCode();
    }

    // 全屏
    if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
    }
});
```

---

## 九、响应式设计

### 9.1 移动端适配

```css
@media (max-width: 768px) {
    /* 侧边导航变为可折叠 */
    .glass-nav {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }

    .glass-nav.open {
        transform: translateX(0);
    }

    /* 代码浮窗全屏 */
    .code-float {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        max-height: 50vh;
        border-radius: 16px 16px 0 0;
        transform: translateY(100%);
    }

    .code-float.active {
        transform: translateY(0);
    }

    /* 控制栏垂直布局 */
    .control-bar {
        flex-wrap: wrap;
        padding: 8px;
    }

    /* 隐藏次要元素 */
    .step-dots {
        display: none;
    }
}
```

---

## 十、质量检查清单

### 10.1 HTML可视化演示

- [ ] 数据流背景正常运行
- [ ] 毛玻璃导航显示正确
- [ ] GSAP动画流畅(60fps)
- [ ] 分步控制正常(上一步/下一步)
- [ ] 速度调节功能可用(0.5x/1x/1.5x)
- [ ] 卡片切换淡入淡出流畅
- [ ] 代码浮窗可正常收起
- [ ] 进度指示准确
- [ ] 键盘快捷键响应

### 10.2 配套文件

- [ ] 02-口播文案.md包含时间轴标记
- [ ] 03-短视频简介.md包含多平台版本
- [ ] 04-技术文章.md包含项目链接和视频平台信息
- [ ] 05-AI生成提示词.md包含3种比例的详细提示词
- [ ] 所有文件命名符合规范

---

## 十一、设计原则

1. **不要追求复杂**：能用简单图形表达就不用复杂的
2. **动画不是目的**：动画是手段，目的是让用户理解原理
3. **代码要精简**：只展示核心逻辑，不要完整的样板代码
4. **步骤要合理**：每个步骤只讲一个点，不要一次灌输太多
5. **留有思考空间**：动画速度适中，给用户理解的时间

---

> 本设计思想整合了**全屏卡片式布局**、**GSAP专业动画控制**和**短视频创作工作流**，提供一个统一的HTML可视化演示方案。
