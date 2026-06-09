# AI Study Vault — Agent 操作手册

> 本文档写给 AI Agent（如 GitHub Copilot、ChatGPT、Claude）。说明当用户提供原始学习材料（PDF 讲义、聊天记录等）时，Agent 应如何按规范完成：**放置材料 → 切分 block → 挂载内容 → 上线验证**。

---

## 目录

1. [概念速览](#1-概念速览)
2. [接收材料阶段](#2-接收材料阶段)
3. [分析识别阶段](#3-分析识别阶段)
4. [放置文件阶段](#4-放置文件阶段)
5. [渲染 PDF 阶段](#5-渲染-pdf-阶段)
6. [切分 block 阶段](#6-切分-block-阶段)
7. [解析聊天记录阶段](#7-解析聊天记录阶段)
8. [编写 MDX 阶段](#8-编写-mdx-阶段)
9. [挂载上线阶段](#9-挂载上线阶段)
10. [验证阶段](#10-验证阶段)
11. [常见问题排查](#11-常见问题排查)
12. [文件模板速查](#12-文件模板速查)

---

## 1. 概念速览

### 核心层级

```
课程 (Course)
 └── 讲义 (Lecture)          ← 一门课有多个讲义
      └── 知识点块 (Block)   ← 最小学习单元，对应讲义中的一组页
           ├── block.yml      元数据
           └── explanation.mdx AI 讲解
```

### 关键文件

| 文件 | 作用 | 谁创建 |
|---|---|---|
| `content/courses/<course-id>/course.yml` | 课程信息 + 讲义列表 | Agent |
| `content/courses/<course-id>/lectures/<lecture-id>/source.yml` | 讲义信息 + block ID 列表 | Agent |
| `content/courses/<course-id>/lectures/<lecture-id>/blocks/<block-id>/block.yml` | block 元数据（页码、知识点） | Agent |
| `content/courses/<course-id>/lectures/<lecture-id>/blocks/<block-id>/explanation.mdx` | AI 讲解，KaTeX 数学 | Agent（从聊天提取） |
| `public/pages/<lecture-id>/page-01.png … page-NN.png` | PDF 渲染图片 | `render_pdf.py` 生成 |
| `inbox/raw/` | 用户提供的原始 PDF | 用户放入 |
| `inbox/chats/` | 用户提供的聊天记录 | 用户放入 |

### ID 命名规则

| 类型 | 规则 | 示例 |
|---|---|---|
| course-id | 英文小写 + 连字符 | `optimization-methods` |
| lecture-id | `lecture-` + 两位数字 + 英文描述 | `lecture-07-gradient-descent` |
| block-id | 课程缩写 + `-` + 三位数字 | `opt-gd-001`, `opt-gd-002` |

> 课程缩写规则：取 course-id 中每个单词的首几个字母。例如 `optimization-methods` → `opt`；`gradient-descent` → `gd`；所以 lecture-07 的 block ID 前缀为 `opt-gd`。

---

## 2. 接收材料阶段

### 用户可能提供的材料

- **PDF 讲义** (`.pdf`) — 单文件，多页，通常有页码和章节标题
- **聊天记录** (`.txt`) — 用户与 AI 的逐页讨论。常见格式：
  - ChatGPT 复制粘贴的纯文本
  - 包含用户消息 + AI 回复交替
- **补充说明** — 如"这是最优化方法的第 7 讲"、"从第 2 页开始讨论"

### Agent 应立即做的事情

1. **确认数量和来源**
   - 问清楚：这些材料属于哪个课程？是第几讲？
   - 如果用户已说明则跳过

2. **检查材料完整性**
   - PDF 是否可读？页数多少？
   - 聊天记录是否包含完整对话？起始/终止页码在哪？

3. **判断是否需要切分**
   - 如果聊天记录里已经按"第 X 页"分段 → 可直接对齐
   - 如果聊天记录是一大段 → 需要按页码边界切分

### 示例对话

```
用户: 这是最优化方法第7讲的PDF和AI讲解记录，帮我上线

Agent 应做:
1. 确认: course=optimization-methods, lecture=07
2. 读取 PDF 页数 → 确定共 28 页
3. 读取聊天记录 → 识别按页码分段的模式
4. 规划 block 切分方案 → 向用户确认
5. 执行后续步骤
```

---

## 3. 分析识别阶段

### 3.1 分析 PDF

**目标**：确定页数、页码范围、可能的章节切分点。

```bash
# 方法 1：用 PyMuPDF 获取页数
python -c "import fitz; doc=fitz.open('inbox/raw/optimization/xxx.pdf'); print(len(doc))"

# 方法 2：查看文件名推断
# 文件名通常包含 lecture 编号和主题
```

**输出**：
- 总页数 (如 28)
- 建议的 block 切分方案 (如分成 9 个 block)

### 3.2 分析聊天记录

**目标**：识别聊天结构，提取 AI 回复，标记页码边界。

聊天记录通常有两种格式：

**格式 A：结构化的逐页讲解**
```
用户: 请从第2页开始讲解最优化方法梯度下降
AI: （讲解内容，对应页 2-6）
---
用户: 好的，请继续下一页
AI: （讲解内容，对应页 7-9）
```

**格式 B：长对话夹杂追问**
```
AI: （大段讲解）
用户: 我不懂 Lipschitz 条件是什么
AI: （补充解释 Lipschitz）
用户: 懂了，请继续
AI: （继续讲解下一页）
```

对格式 B，需要区分"主讲解"和"追问补充"——追问内容后续作为 patch 挂到对应 block。

### 3.3 输出 block 切分方案

分析完成后，列出切分建议：

```
Block 1: opt-gd-001 | 页 2-6  | 梯度下降基本框架      | 6 个知识点
Block 2: opt-gd-002 | 页 7-9  | 精确线搜索与之字形现象  | 5 个知识点
Block 3: opt-gd-003 | 页 10-12| Lipschitz梯度与光滑函数 | 4 个知识点
...
```

**向用户确认后再继续。**

---

## 4. 放置文件阶段

### 4.1 原始材料放入 inbox

```
inbox/
  raw/
    optimization/
      Optimization_lecture_7_2026_Gradient descent methods.pdf
  chats/
    梯度下降法讲解.txt                  ← 聊天记录放这里
```

> 文件名尽量保持原始文件名，方便追溯。

### 4.2 决定 course-id 和 lecture-id

```
course-id:   optimization-methods
lecture-id:  lecture-07-gradient-descent
```

规则：
- course-id：英文小写，单词间用连字符
- lecture-id：`lecture-` + 两位数字 + `-` + 主题英文

---

## 5. 渲染 PDF 阶段

### 5.1 运行渲染脚本

```bash
python scripts/render_pdf.py \
  --pdf "inbox/raw/optimization/Optimization_lecture_7_2026_Gradient descent methods.pdf" \
  --lecture lecture-07-gradient-descent
```

### 5.2 输出

```
public/pages/lecture-07-gradient-descent/
  page-01.png
  page-02.png
  ...
  page-28.png
```

URL 路径：`/pages/lecture-07-gradient-descent/page-01.png`

### 5.3 注意事项

- 图片分辨率默认 200 DPI，可通过 `--dpi 300` 提高清晰度
- PNG 文件较大（28 页约 30-50MB），已在 `.gitignore` 中排除
- 每次修改 PDF 后需重新运行
- **不要**把 `public/pages/` 提交到 Git

---

## 6. 切分 block 阶段

### 6.1 创建目录结构

```
content/courses/optimization-methods/
  course.yml
  lectures/
    lecture-07-gradient-descent/
      source.yml
      blocks/
        opt-gd-001/
          block.yml
          explanation.mdx      ← 稍后填充
        opt-gd-002/
          block.yml
          explanation.mdx
        ...
        opt-gd-009/
          block.yml
          explanation.mdx
```

### 6.2 创建 YAML 文件

#### `course.yml`

```yaml
id: optimization-methods
title: 最优化方法
title_en: Optimization Methods
description: 系统学习最优化理论与方法，从迭代算法框架到梯度下降法的收敛分析
instructor: AI Study Vault
semester: 2026 Spring
language: zh
lectures:
  - id: lecture-07-gradient-descent
    title: 第7讲 梯度下降法
    title_en: "Lecture 7: Gradient Descent Methods"
    pages: 28
    date: "2026-06-09"       # ← 必须加引号！
```

#### `source.yml`

```yaml
id: lecture-07-gradient-descent
course: optimization-methods
title: 第7讲 梯度下降法
title_en: "Lecture 7: Gradient Descent Methods"
pages: 28
source_file: Optimization_lecture_7_2026_Gradient descent methods.pdf
source_type: pdf
date: "2026-06-09"           # ← 必须加引号！
language: zh
blocks:
  - opt-gd-001
  - opt-gd-002
  - opt-gd-003
  # ... 列出所有 block ID
```

#### `block.yml`（每个 block 一个）

```yaml
id: opt-gd-001
course: optimization-methods
lecture: lecture-07-gradient-descent
title: 梯度下降基本框架
title_en: Gradient Descent Basic Framework
pages: "2-6"                 # ← 页码范围（字符串）
topics:
  - 无约束优化问题
  - 迭代算法格式
  - 下降方向定义
  - 负梯度与最速下降
  - 停止准则
  - 步长选择方法
status: completed
created: 2026-06-09
```

### 6.3 Block 切分原则

1. **按语义边界切分**，不按固定页数
   - 一个定理/概念完整时放同一个 block
   - 宁可多几个小 block，不要一个 block 覆盖太多主题
2. **pages 字段用连字符表示范围**：`"2-6"` 表示第 2 页到第 6 页
3. **topics 列表**：提取该 block 覆盖的 3-8 个核心知识点
4. **每个 block 不超过 15KB MDX** 为宜，太长影响阅读体验

---

## 7. 解析聊天记录阶段

### 7.1 提取 AI 回复

从聊天记录中提取 AI 的讲解内容，按页码边界切分。

**关键步骤**：

1. **去掉分隔符**：移除 `===`、`---` 等无意义分隔线
2. **去掉用户短消息**：如"好的，请继续"、"我明白了"
3. **保留用户追问**：有价值的追问（如"Lipschitz 条件是什么"）应保留
4. **定位页码边界**：找到"第 X 页"或"下一页"标记

### 7.2 聊天截断策略

常见页码边界标记：

```
好，我们继续第 14 页
下面开始第 16 页的内容
现在是第 22-26 页
下一部分是第 27 页
```

用这些标记作为 block 边界，将 AI 回复分配到对应 block。

### 7.3 输出：每个 block 的原始 AI 回复文本

```
Block opt-gd-001 (页 2-6): "好的，从第2页开始。无约束优化..."
Block opt-gd-002 (页 7-9): "好，现在到第7页。精确线搜索..."
...
```

---

## 8. 编写 MDX 阶段

### 8.1 数学公式转换 ⚠️ 关键步骤

原始聊天记录中的数学公式格式与 KaTeX 不兼容，**必须转换**：

| 原始格式 | KaTeX 格式 | 示例 |
|---|---|---|
| `[...]`（单独行） | `$$...$$` | `$$f(x) = \frac{1}{2}x^TQx$$` |
| `(...)`（行内） | `$...$` | `$\nabla f(x)$` |

**转换规则（重要）**：

1. **先转换 `[...]` 再转换 `(...)`**，避免行内匹配错误
2. `(...)` 中如果包含超过 2 个中文字符，**不要转换**（那是中文括号）
3. `(...)` 可能嵌套：`(\nabla f(x))` 应正确匹配最外层
4. `$$` 行**不要**被当作"短行"跳过

### 8.2 MDX 编写规范

```mdx
### 标题

正文内容...

$$
\min_{x \in \mathbb{R}^n} f(x)
$$

正文中引用行内公式 $\alpha_k$ 和 $\nabla f(x_k)$。

<Callout type="info">
  这是一个重要提示：步长的选择直接影响收敛速度。
</Callout>

<Callout type="warning">
  注意：非凸情形下梯度下降可能收敛到鞍点而非局部极小值。
</Callout>

<Theorem title="梯度下降收敛定理">
  设 $f$ 是凸函数且梯度 $L$-Lipschitz 连续，步长 $\alpha = 1/L$，则
  $$
  f(x_k) - f^* \leq \frac{L\|x_0 - x^*\|^2}{2k}
  $$
</Theorem>

<Proof>
  由 Lipschitz 条件展开 $f(x_{k+1})$ 可得...
</Proof>
```

### 8.3 可用的 MDX 组件

| 组件 | 用法 | 说明 |
|---|---|---|
| `<Callout type="info">` | 信息框 | 蓝色边框，补充说明 |
| `<Callout type="warning">` | 警告框 | 黄色边框，注意事项 |
| `<Callout type="check">` | 确认框 | 绿色边框，要点总结 |
| `<Theorem title="...">` | 定理块 | 带标题的定理陈述 |
| `<Proof>` | 折叠证明 | 默认折叠，点击展开 |

### 8.4 注意事项

- **不要**转义 LaTeX 花括号（`{...}` 由 remark-math 处理）
- **不要**在 `$$...$$` 内部添加额外空格或换行
- 中文和英文之间建议添加空格（由格式化工具处理）
- 如果 MDX 编译报 `Could not parse expression with acorn`，检查是否有 `$` 未闭合或混入了非数学内容

---

## 9. 挂载上线阶段

### 9.1 检查文件完整性

```bash
# 验证所有 YAML 可解析
node -e "
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const blocksDir = 'content/courses/optimization-methods/lectures/lecture-07-gradient-descent/blocks';
const dirs = fs.readdirSync(blocksDir);
for (const d of dirs) {
  const f = path.join(blocksDir, d, 'block.yml');
  try {
    const data = yaml.load(fs.readFileSync(f, 'utf-8'));
    console.log(d + ': OK -', data.title);
  } catch(e) {
    console.log(d + ': FAIL -', e.message);
  }
}
"
```

### 9.2 确保 course.yml 包含 lectures 列表

**关键**：`course.yml` 中需要有 `lectures` 列表（见 6.2 节模板）。

`lib/content.ts` 中的 `getCourse()` 函数会同时读取：
- `course.yml`（课程基本信息）
- `lectures/<lecture-id>/source.yml`（各讲义信息）

如果 `course.yml` 中没有 lectures 列表，课程页会显示"暂无讲义"。

### 9.3 启动开发服务器验证

```bash
npm run dev

# 检查以下页面都能正常返回 200：
#   首页:               http://localhost:3001
#   课程列表:           http://localhost:3001/courses
#   课程详情:           http://localhost:3001/courses/<course-id>
#   讲义页(第一个block): http://localhost:3001/courses/<course-id>/lectures/<lecture-id>?block=<block-id>
#   搜索:               http://localhost:3001/search
```

### 9.4 构建搜索索引

```bash
npm run index
# 或
python scripts/studyvault/index/build_search_index.py

# 验证搜索 API
curl http://localhost:3001/api/search?q=梯度下降
```

### 9.5 Git 提交

```bash
git add content/ public/pages/ scripts/
# 注意：public/pages/ 在 .gitignore 中已排除，不会被提交
git commit -m "feat: 添加 XXX 讲义（页 X-Y，N 个 block）"
git push
```

---

## 10. 验证阶段

### 10.1 检查清单

- [ ] `course.yml` 中 `date` 字段加引号 `"2026-06-09"`
- [ ] `source.yml` 中 `date` 字段加引号
- [ ] `block.yml` 中 `pages` 用字符串 `"2-6"` 而非数字
- [ ] 所有 `explanation.mdx` 语法正确，无 acorn 解析错误
- [ ] `[...]` 已转换为 `$$...$$`，`(...)` 已转换为 `$...$`
- [ ] PDF 已渲染为 PNG，路径与 block 的 pages 字段匹配
- [ ] `course.yml` lectures 列表包含所有讲义
- [ ] `source.yml` blocks 列表包含所有 block ID
- [ ] 课程页 → 讲义页 → block 切换 全部可用
- [ ] 搜索 API 返回正确结果

### 10.2 常见错误及修复

| 错误 | 原因 | 修复 |
|---|---|---|
| `Objects are not valid as a React child (found: [object Date])` | YAML date 未加引号 | 改为 `date: "2026-06-09"` |
| `Could not parse expression with acorn` | MDX 中的 `{...}` 或 `$` 混入非数学内容 | 检查花括号配对，减少非必要 `$` |
| 课程页显示"暂无讲义" | `course.yml` 缺少 `lectures` 列表 | 添加 lectures 列表 |
| 左侧没有图片 | PDF 未渲染 | 运行 `python scripts/render_pdf.py` |
| 切换 block 时图片不变 | `pages` 字段不匹配 | 检查 `block.yml` 的 `pages` 是否正确 |

---

## 11. 常见问题排查

### Q: 聊天记录中 `[...]` 和 `(...)` 怎样准确转换？

A: 必须分两步：

1. **先转换 `[...]`**：匹配以 `[...` 开头、`...]` 结尾的独立行 → `$$...$$`
2. **后转换 `(...)`**：用栈匹配最外层 `()` ，排除中文括号

Python 伪代码：
```python
# 第一步：转换 [...]
converted = re.sub(r'^\[(.+?)\]$', r'$$\1$$', line, flags=re.MULTILINE)

# 第二步：转换 (...) → $...$
# 从右向左扫描，用栈匹配最外层 ()
def convert_inline_math(text):
    result = []
    i = len(text) - 1
    depth = 0
    while i >= 0:
        if text[i] == ')':
            if depth == 0:
                end = i
            depth += 1
        elif text[i] == '(':
            depth -= 1
            if depth == 0:
                content = text[i+1:end]
                if not is_chinese_text(content):
                    result.append('$' + content + '$')
                    # 跳过已处理的内容
        else:
            if depth == 0:
                result.append(text[i])
        i -= 1
    return ''.join(reversed(result))

def is_chinese_text(s):
    chinese_chars = sum(1 for c in s if '\u4e00' <= c <= '\u9fff')
    return chinese_chars > 2
```

### Q: 怎么判断聊天记录中哪段是 AI 回复？

A: 通常看消息前缀。常见模式：
- 用户：`你：`、`User:`、`我：`、空行后短句
- AI：`ChatGPT:`、`AI：`、`助手：`、长段落、包含公式

如果无法自动判断，手动标注后用正则提取。

### Q: 如何确保 PDF 页码与 block 的 pages 字段一致？

A: 页面组件会解析 `pages: "2-6"` → `[2, 3, 4, 5, 6]` → 加载 `/pages/<lecture-id>/page-02.png` 到 `page-06.png`。

确保：
1. PDF 页码从 1 开始（不是从 0）
2. `render_pdf.py` 输出的文件名格式为 `page-01.png`, `page-02.png`...
3. block 的 `pages` 与内容实际覆盖的页码一致

---

## 12. 文件模板速查

### course.yml
```yaml
id: <course-id>
title: <课程中文名>
title_en: <课程英文名>
description: <一句话描述>
instructor: AI Study Vault
semester: <学期>
language: zh
lectures:
  - id: <lecture-id>
    title: <讲义中文标题>
    title_en: "<英文标题（含冒号时加引号）>"
    pages: <总页数>
    date: "<YYYY-MM-DD>"
```

### source.yml
```yaml
id: <lecture-id>
course: <course-id>
title: <讲义中文标题>
title_en: "<英文标题>"
pages: <总页数>
source_file: <原始PDF文件名>
source_type: pdf
date: "<YYYY-MM-DD>"
language: zh
blocks:
  - <block-id-1>
  - <block-id-2>
  # ...列出所有block
```

### block.yml
```yaml
id: <block-id>
course: <course-id>
lecture: <lecture-id>
title: <块中文标题>
title_en: <块英文标题>
pages: "<起始页>-<结束页>"
topics:
  - <知识点1>
  - <知识点2>
  - ...
status: completed
created: <YYYY-MM-DD>
```

---

> **记住核心原则**：内容文件系统本身就是数据库。所有修改直接在 YAML/MDX/PNG 文件中完成，不需要数据库迁移。
