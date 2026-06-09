# AI Study Vault

> 个人知识学习库 —— 结构化学习资料，原文与 AI 讲解左右对照阅读

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?logo=python)](https://www.python.org/)

---

## 这是什么

AI Study Vault 帮助你解决一个常见的学习痛点：**和 AI（ChatGPT 等）逐页讨论了整本讲义，但聊天记录散乱无序，无法复习**。

它的核心思想是：

1. **原文材料是骨架** —— PDF 讲义、论文、课件等
2. **AI 聊天是原材料** —— 需要被解析、切分、对齐到对应的原文位置
3. **最小学习单元是 block** —— 每个 block 有稳定的 ID，对应原文的几页
4. **左右对照阅读** —— 左侧显示 PDF 原页，右侧显示 AI 讲解

> 项目设计理念详见 [`ideas.md`](./ideas.md)（原始设计文档）
> Agent 协作约定见 [`AGENTS.md`](./AGENTS.md)

---

## 当前状态

### 已上线 ✅

- **课程浏览** — `/courses` 列出所有课程
- **讲义页面** — 左右对照式 block reader
- **9 个知识点块** — "最优化方法 → 第7讲 梯度下降法" 完整覆盖
- **PDF 原页渲染** — 每页 PDF 转高清 PNG，左侧显示
- **AI 讲解** — MDX + KaTeX 数学公式渲染，右侧显示
- **块间导航** — 侧边栏切换 + 上一块/下一块
- **搜索** — Fuse.js 全文搜索（`/search`）

### 进行中 🚧

- 搜索索引构建脚本
- 更多课程和讲义内容
- 聊天记录自动解析与对齐

---

## 项目结构

```
having learnt/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 全局布局（导航栏）
│   ├── page.tsx                  # 首页
│   ├── globals.css               # 全局样式 + KaTeX 覆盖
│   ├── courses/
│   │   ├── page.tsx              # 课程列表页
│   │   └── [courseId]/
│   │       ├── page.tsx          # 课程详情（讲义列表）
│   │       └── lectures/[lectureId]/
│   │           └── page.tsx      # Block Reader（左右对照阅读）
│   ├── search/
│   │   └── page.tsx              # 搜索页
│   └── api/search/
│       └── route.ts              # 搜索 API
│
├── components/                   # React 组件
│   ├── Callout.tsx               # MDX 提示框组件
│   ├── CourseNav.tsx             # 侧边栏块导航
│   └── Theorem.tsx               # 定理/证明折叠组件
│
├── lib/
│   └── content.ts               # 核心数据层：读取 YAML/MDX
│
├── content/                      # 内容仓库（文件系统即数据库）
│   └── courses/
│       └── optimization-methods/
│           ├── course.yml        # 课程元数据
│           └── lectures/
│               └── lecture-07-gradient-descent/
│                   ├── source.yml          # 讲义元数据
│                   └── blocks/
│                       ├── opt-gd-001/     # 梯度下降基本框架
│                       ├── opt-gd-002/     # 精确线搜索与之字形现象
│                       ├── opt-gd-003/     # Lipschitz梯度与光滑函数
│                       ├── opt-gd-004/     # 非凸情形收敛分析
│                       ├── opt-gd-005/     # 凸函数O(1/k)收敛速度
│                       ├── opt-gd-006/     # 强凸函数与线性收敛
│                       ├── opt-gd-007/     # 预条件梯度下降
│                       ├── opt-gd-008/     # 收敛率分类
│                       └── opt-gd-009/     # 实现复杂度与逻辑回归
│                           ├── block.yml   # 块元数据
│                           └── explanation.mdx  # AI 讲解（KaTeX 数学）
│
├── public/pages/                 # PDF 渲染图片（Git 忽略）
│   └── lecture-07-gradient-descent/
│       └── page-01.png ... page-28.png
│
├── scripts/
│   ├── render_pdf.py             # PDF → PNG 渲染脚本
│   └── studyvault/               # 内容处理管线（CLI）
│       ├── cli.py
│       ├── chat/parse_plain_chat.py
│       └── index/build_search_index.py
│
├── inbox/                        # 原始材料暂存区
│   ├── raw/                      # PDF、PPTX 等
│   └── chats/                    # 聊天记录导出
│
├── data/indexes/                 # 搜索索引（构建生成）
│
├── AGENTS.md                     # Agent 协作约定
├── README.original.md            # 原始设计文档
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── pyproject.toml
```

---

## 技术栈

| 层 | 技术 | 用途 |
|---|---|---|
| 前端框架 | Next.js 14 (App Router) | 页面路由、SSR |
| UI | React 18 + TypeScript 5.4 | 组件开发 |
| 样式 | Tailwind CSS 3.4 | 原子化 CSS |
| 数学公式 | KaTeX + remark-math + rehype-katex | LaTeX 渲染 |
| MDX | next-mdx-remote 5 | AI 讲解内容 |
| 搜索 | Fuse.js 7 | 客户端全文搜索 |
| 内容解析 | js-yaml | YAML 元数据读取 |
| PDF 渲染 | PyMuPDF (Python) | PDF 转 PNG 图片 |
| CLI 工具 | Typer + Rich (Python) | 内容处理命令行 |

---

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.11+
- npm

### 安装

```bash
# 克隆仓库
git clone <repo-url>
cd "having learnt"

# 安装前端依赖
npm install

# 安装 Python 依赖（用于 PDF 渲染等脚本）
pip install PyMuPDF typer rich
```

### 开发

```bash
# 启动 Next.js 开发服务器（默认 3000，被占用则自动 3001）
npm run dev

# 浏览器访问
#   首页:     http://localhost:3001
#   课程列表: http://localhost:3001/courses
#   讲义页:   http://localhost:3001/courses/optimization-methods/lectures/lecture-07-gradient-descent
```

### 构建

```bash
npm run build    # 生产构建
npm start        # 启动生产服务器
```

---

## 添加新内容

### 1. 放入原始材料

```bash
inbox/raw/optimization/new-lecture.pdf   # PDF 讲义
inbox/chats/new-lecture-chat.txt         # AI 对话记录
```

### 2. 渲染 PDF 为图片

```bash
python scripts/render_pdf.py \
  --pdf   "inbox/raw/optimization/new-lecture.pdf" \
  --lecture lecture-08-new-methods
```

### 3. 创建内容文件

按以下结构创建课程、讲义、block 的 YAML 和 MDX：

```
content/courses/<course-id>/
  course.yml              # 课程信息
  lectures/<lecture-id>/
    source.yml             # 讲义信息、block 列表
    blocks/<block-id>/
      block.yml            # 块元数据（标题、页码、知识点）
      explanation.mdx      # AI 讲解（MDX + KaTeX 公式）
```

### 4. 构建搜索索引

```bash
npm run index
# 或 python scripts/studyvault/index/build_search_index.py
```

---

## 文件约定

| 文件 | 格式 | 说明 |
|---|---|---|
| `course.yml` | YAML | 课程 id、title、description |
| `source.yml` | YAML | 讲义 id、pages、blocks 列表、date |
| `block.yml` | YAML | 块 id、title、pages（如 "2-6"）、topics、status |
| `explanation.mdx` | MDX | AI 讲解，支持 KaTeX 公式和自定义组件 |

### YAML 日期须知

⚠️ `date` 字段务必加引号：

```yaml
date: "2026-06-09"   # ✅ 正确 —— 字符串
date: 2026-06-09     # ❌ 错误 —— 被 js-yaml 解析为 Date 对象
```

---

## MDX 组件

在 `explanation.mdx` 中可使用以下自定义组件：

```mdx
<Callout type="info">
  这是一个提示信息。
</Callout>

<Callout type="warning">
  这是一个警告。
</Callout>

<Theorem title="梯度下降收敛定理">
  设 $f$ 是凸函数且梯度 Lipschitz 连续...
</Theorem>

<Proof>
  由 Lipschitz 条件可得...
</Proof>
```

KaTeX 数学公式：

```mdx
行内公式：$\nabla f(x)$
显示公式：
$$
\min_{x \in \mathbb{R}^n} f(x)
$$
```

---

## 命令参考

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |
| `npm run index` | 构建搜索索引 |
| `python scripts/render_pdf.py` | 渲染 PDF 为 PNG |
| `python scripts/studyvault/cli.py --help` | CLI 工具帮助 |

---

## License

MIT
