# AI Study Vault

AI Study Vault 是一个用于整理论文、课件、讲义、教材片段与 ChatGPT 学习对话的个人知识网站。它的目标不是简单保存聊天记录，而是把“原文材料 + AI 逐段讲解 + 后续追问 + 补充解释”整理成可以长期复习、可以搜索、可以继续扩展的结构化学习资料库。

这个项目默认面向一个真实使用场景：用户手里通常只有原论文、PDF 讲义、PPT、教材截图，以及从 ChatGPT 导出的聊天记录或手动复制出来的聊天文本。用户不应该手工完成大量切分、对齐、整理工作。切分、对齐、归档、重构、生成阅读页面这些工作应尽可能由脚本与 Agent 完成，用户只负责放入材料、检查少量不确定结果、继续提问和学习。

---

## 1. 项目目标

本项目要解决三个核心问题。

第一个问题是，AI 讲解全部堆在聊天框里，不方便翻找和复习。聊天记录天然按照时间排序，但学习材料天然按照章节、页码、定理、公式、例题、实验、代码模块排序。项目需要把聊天记录转换成“围绕原文结构组织”的学习页面。

第二个问题是，学习过程中经常会回头追问前面的内容，导致聊天顺序和知识顺序不一致。项目需要允许后续追问被挂回对应的知识块，而不是永远留在聊天记录末尾。

第三个问题是，原文与解释不能对照阅读。项目需要提供左右对照式阅读体验：左侧显示原文 PDF/PPT 页图或原文摘录，右侧显示 AI 解释、补充问答、用户笔记、理解状态与相关知识链接。

最终目标是形成一个个人学习知识库。它既像一个文档网站，又像一个可持续更新的个人教材生成器。

---

## 2. 核心原则

本项目以“原文材料”为骨架，而不是以“聊天记录”为骨架。

聊天记录只是一种原材料。它需要被解析、拆解、归位、重写和补丁化。真正进入学习网站的内容应该是结构化 block，而不是原样复制的长聊天。

项目中的最小学习单位叫做 block。一个 block 通常对应论文中的一个小节、讲义中的一组页、PPT 中的一页或几页、一个定理、一个证明、一个公式、一个实验图表、一个代码模块，或者一个用户认为需要单独学习的概念。

每个 block 都必须拥有稳定的 id。后续的 AI 讲解、补充追问、用户理解状态、相关概念链接，都围绕这个 id 组织。

---

## 3. 典型使用场景

用户正在学习“最优化方法”课程。用户手里有若干 PDF 讲义，也有之前与 ChatGPT 的逐段讲解聊天记录。用户把这些材料放进 inbox，然后运行导入流程。系统自动识别课程、讲义、页码、标题、章节，并生成初步 block。

之后系统尝试把聊天记录中的问答和讲义中的 block 对齐。例如，聊天记录里出现“我理解了回溯线搜索的方法，请继续”，系统可以判断前后的讲解内容可能属于“回溯线搜索”相关 block。若系统不确定，则把它放入 review 队列，由用户确认。

用户打开网站后，可以看到“最优化方法”课程主页。点进“Lecture 03 Newton Method”，页面显示自动切分出来的 block。点进“回溯线搜索与 Armijo 条件”，左侧是原讲义对应页图，右侧是 AI 讲解。用户如果又不懂某句话，可以在网页上标记问题。系统生成一个 prompt packet，用户把它发给 ChatGPT，得到回答后复制回来。Agent 再把这个回答作为 patch 挂回对应 block，必要时重写主讲解。

---

## 4. 技术栈建议

本项目建议采用“Python 内容处理管线 + Next.js 阅读网站 + Markdown/MDX 内容仓库”的结构。

Python 负责原始材料导入、PDF/PPT 转图片、文本提取、聊天记录解析、block 切分、相似度对齐、prompt packet 生成、patch 合并与索引构建。

Next.js 负责前端网站、左右对照阅读器、课程导航、block 页面、标记问题、搜索与本地状态管理。

MDX 负责保存 AI 讲解内容。相比普通 Markdown，MDX 更适合未来插入公式卡片、代码解释组件、折叠证明、图表说明、交互式复习卡片等内容。

建议的核心依赖如下：

```text
Frontend:
- Next.js
- React
- TypeScript
- MDX
- Tailwind CSS
- KaTeX 或 MathJax
- Fuse.js 或 Pagefind，本地搜索可任选其一

Backend / Scripts:
- Python 3.11+
- PyMuPDF，用于 PDF 页图渲染和文本提取
- python-pptx，用于读取 PPTX 文本
- LibreOffice CLI，用于将 PPT/PPTX 转 PDF 再转图片
- MarkItDown，用于将多种文档格式转为 Markdown
- pydantic，用于校验元数据 schema
- rich 或 typer，用于命令行工具
- sentence-transformers 或 OpenAI embeddings，用于语义对齐，可选
- rapidfuzz，用于文本相似度匹配，可选
```

第一版不要急着引入数据库。内容文件系统本身就是数据库。所有核心内容都应该以 Markdown、MDX、YAML、JSON 的形式保存在仓库里，方便 Git 管理、人工修正、Agent 修改和长期迁移。

---

## 5. 推荐仓库结构

```text
ai-study-vault/
  README.md
  AGENTS.md
  package.json
  pyproject.toml
  .gitignore
  .env.example

  inbox/
    raw/
      optimization/
        lecture-03-newton-method.pdf
      papers/
        causal-weighting-paper.pdf
    chats/
      optimization-newton-chat.txt
      causal-paper-chat-export.json
    questions/
      2026-06-09-question-001.yml
    ai_responses/
      2026-06-09-response-001.md

  content/
    courses/
      optimization-methods/
        course.yml
        lectures/
          lecture-03-newton-method/
            source.yml
            raw/
              lecture-03-newton-method.pdf
            assets/
              pages/
                page-001.png
                page-002.png
              figures/
            extracted/
              pages.json
              fulltext.md
              outline.yml
            blocks/
              opt-newton-001/
                block.yml
                source.md
                explanation.mdx
                questions.md
                patches/
                  2026-06-09-positive-definite-direction.md
              opt-newton-002/
                block.yml
                source.md
                explanation.mdx
                questions.md
                patches/

    papers/
      causal-weighting-paper/
        paper.yml
        raw/
          paper.pdf
        assets/
          pages/
          figures/
        extracted/
          pages.json
          fulltext.md
          outline.yml
        blocks/
          causal-weight-001/
            block.yml
            source.md
            explanation.mdx
            questions.md
            patches/

  data/
    indexes/
      blocks.json
      search.json
      concepts.json
      unresolved.json
    embeddings/
      block_embeddings.jsonl
      chat_embeddings.jsonl

  scripts/
    studyvault/
      ingest/
        ingest_pdf.py
        ingest_pptx.py
        render_pages.py
        extract_text.py
      segment/
        segment_document.py
        build_outline.py
        create_blocks.py
      chat/
        parse_chatgpt_export.py
        parse_plain_chat.py
        split_dialogue.py
      align/
        align_chat_to_blocks.py
        score_alignment.py
        review_uncertain.py
      ai/
        build_prompt_packet.py
        apply_ai_response.py
        merge_patch.py
        rewrite_explanation.py
      index/
        build_search_index.py
        build_concept_graph.py
      validate/
        validate_content.py
        validate_links.py
        validate_schema.py

  site/
    app/
      page.tsx
      courses/
      papers/
      block/
    components/
      ReaderLayout.tsx
      SourcePane.tsx
      ExplanationPane.tsx
      QuestionBox.tsx
      PatchList.tsx
      ConceptLinks.tsx
      ProgressBadge.tsx
    lib/
      content.ts
      search.ts
      block.ts
    public/
      content-assets/
    styles/

  prompts/
    system/
      segmentation.md
      alignment.md
      explanation.md
      patch_merge.md
    templates/
      explain_block.md
      answer_question.md
      merge_patch.md
```

---

## 6. 内容数据模型

### 6.1 course.yml

course.yml 描述一门课程或一个长期学习主题。

```yaml
id: optimization-methods
title: 最优化方法
type: course
description: 梯度下降、牛顿法、拟牛顿法、信赖域、共轭梯度等内容的课程学习资料。
created_at: 2026-06-09
updated_at: 2026-06-09
tags:
  - optimization
  - math
  - course
default_language: zh
```

### 6.2 source.yml

source.yml 描述一份原始材料。

```yaml
id: lecture-03-newton-method
title: Lecture 03 Newton Method
parent_id: optimization-methods
source_type: lecture
file_name: lecture-03-newton-method.pdf
file_format: pdf
raw_path: raw/lecture-03-newton-method.pdf
page_count: 32
status: imported
created_at: 2026-06-09
updated_at: 2026-06-09
```

### 6.3 block.yml

block.yml 描述一个最小学习单元。

```yaml
id: opt-newton-003
title: 回溯线搜索与 Armijo 条件
parent_source_id: lecture-03-newton-method
parent_course_id: optimization-methods
source_type: lecture
page_start: 12
page_end: 14
order: 3
status: learning
difficulty: medium
confidence:
  segmentation: 0.86
  chat_alignment: 0.74
tags:
  - 最优化
  - 牛顿法
  - 线搜索
  - Armijo条件
concepts:
  - line-search
  - sufficient-decrease
  - backtracking
related_blocks:
  - opt-gd-006
  - opt-newton-002
created_at: 2026-06-09
updated_at: 2026-06-09
```

### 6.4 source.md

source.md 保存该 block 对应的原文摘录。它不需要复制整份原文，只需要保留便于 AI 和用户对照的局部文本。

```md
# 原文摘录

来源：lecture-03-newton-method.pdf，第 12-14 页。

这里保存从 PDF/PPT 提取出的文本。若提取质量较差，则保留页码与截图引用，等待人工或 OCR 补充。
```

### 6.5 explanation.mdx

explanation.mdx 保存整理后的主讲解。它不应该是原始聊天记录，而应该是被重写成教材式顺序的解释。

```mdx
# 回溯线搜索与 Armijo 条件

这一节的核心问题是：当我们已经有了一个下降方向以后，应该沿着这个方向走多远。

如果步长太大，目标函数可能反而上升；如果步长太小，算法虽然稳定但进展太慢。回溯线搜索的想法是先尝试一个较大的步长，然后不断缩小，直到满足充分下降条件。
```

### 6.6 questions.md

questions.md 保存用户在复习中产生的问题。问题不一定已经解决。

```md
# 问题记录

## 2026-06-09

问题：为什么 Hessian 正定能推出 Newton 方向是下降方向？

状态：待回答
关联位置：explanation.mdx 中“Newton 方向”段落
```

### 6.7 patch 文件

patch 是后续追问得到的新解释。patch 可以先独立保存，不必立刻合并进主讲解。

```md
# Patch: Hessian 正定与下降方向

created_at: 2026-06-09
target_block: opt-newton-003
source_question: 为什么 Hessian 正定能推出 Newton 方向是下降方向？
merge_status: pending

AI 回答正文写在这里。
```

---

## 7. 用户实际需要怎么做

用户不需要手工切分每份讲义。用户只需要做以下几件事。

第一，把原始论文、讲义、PPT、教材 PDF 放入 inbox/raw。文件名尽量可读，例如 lecture-03-newton-method.pdf，而不是 12345.pdf。

第二，把 ChatGPT 聊天记录放入 inbox/chats。聊天记录可以是从 ChatGPT 数据导出的 JSON，也可以是手动复制出来的 txt 或 md。第一版必须同时支持这两类输入。JSON 用于尽量恢复对话标题、时间和角色；纯文本用于兜底。

第三，运行导入命令。导入命令会把原始材料复制到 content 下对应位置，生成页面图片、提取文本、建立 source.yml。

第四，运行自动切分命令。系统会根据标题、页码、公式、PPT 页、论文 section、文本相似度和 LLM 判断生成 blocks。用户只需要检查低置信度结果。

第五，运行聊天对齐命令。系统会把 ChatGPT 问答尽量挂到对应 blocks 上。高置信度的自动归档，低置信度的进入 review 队列。

第六，运行网站。用户通过网页阅读、复习、标记问题。

第七，遇到新问题时，在网页上对某个 block 标记问题。系统生成 prompt packet。用户把 prompt packet 发给 ChatGPT，然后把回答复制回 inbox/ai_responses。系统再把回答转成 patch，挂回对应 block。

---

## 8. 命令行设计

以下命令是建议接口。Agent 开发时应尽量遵守这些命令名称和语义。

### 8.1 初始化项目

```bash
python -m studyvault init
```

该命令创建 content、inbox、data、prompts 等目录，并生成示例配置文件。

### 8.2 导入原始材料

```bash
python -m studyvault ingest inbox/raw/optimization/lecture-03-newton-method.pdf \
  --type lecture \
  --course optimization-methods
```

目标行为：

```text
1. 复制原始文件到 content/courses/optimization-methods/lectures/lecture-03-newton-method/raw/
2. 渲染每一页为 PNG
3. 提取文本到 extracted/pages.json
4. 生成 extracted/fulltext.md
5. 生成 source.yml
6. 更新 data/indexes/blocks.json
```

### 8.3 自动切分文档

```bash
python -m studyvault segment content/courses/optimization-methods/lectures/lecture-03-newton-method
```

目标行为：

```text
1. 读取 source.yml、pages.json、fulltext.md
2. 识别标题、页码、章节、公式、定理、例题、图表
3. 生成初步 outline.yml
4. 生成 blocks
5. 为每个 block 写入 block.yml 和 source.md
6. 标记每个 block 的 segmentation confidence
```

### 8.4 解析聊天记录

```bash
python -m studyvault parse-chat inbox/chats/optimization-newton-chat.txt \
  --course optimization-methods
```

目标行为：

```text
1. 将聊天记录拆成 user / assistant turns
2. 识别“请继续”“我理解了”“回到论文这里”等学习控制语句
3. 抽取主题、关键词、公式、页码线索
4. 输出规范化 dialogue.json
```

### 8.5 对齐聊天记录到 blocks

```bash
python -m studyvault align-chat \
  --chat inbox/chats/optimization-newton-chat.txt \
  --target content/courses/optimization-methods/lectures/lecture-03-newton-method
```

目标行为：

```text
1. 读取 blocks 的 source.md 和 block.yml
2. 读取规范化 dialogue.json
3. 根据关键词、语义相似度、公式、顺序位置进行对齐
4. 高置信度内容写入 explanation.mdx 或 patches
5. 低置信度内容写入 data/indexes/unresolved.json
6. 生成 review 报告
```

### 8.6 生成给 ChatGPT 的追问包

```bash
python -m studyvault build-prompt \
  --block opt-newton-003 \
  --question inbox/questions/2026-06-09-question-001.yml
```

目标行为：

```text
生成一个 prompt packet，包含：
1. block id
2. block 标题
3. 原文摘录
4. 当前 AI 讲解
5. 用户问题
6. 期望回答风格
7. 合并回仓库时需要遵守的格式
```

### 8.7 应用 AI 回答

```bash
python -m studyvault apply-response \
  --block opt-newton-003 \
  --response inbox/ai_responses/2026-06-09-response-001.md
```

目标行为：

```text
1. 读取 AI 回答
2. 判断它是补充解释、纠错、主线重写、例子补充还是证明展开
3. 生成 patch 文件
4. 更新 questions.md 中的问题状态
5. 必要时更新 explanation.mdx，但默认先不自动覆盖
```

### 8.8 合并 patch 到主讲解

```bash
python -m studyvault merge-patch \
  --block opt-newton-003 \
  --patch 2026-06-09-positive-definite-direction.md
```

目标行为：

```text
1. 读取 explanation.mdx 和 patch
2. 生成新的 explanation.mdx
3. 保留原 patch 文件
4. 在 block.yml 中记录 merge history
5. 若置信度较低，则生成 explanation.proposed.mdx 等待人工确认
```

### 8.9 启动网站

```bash
cd site
npm install
npm run dev
```

网站默认从 content 和 data/indexes 读取内容。

---

## 9. 自动切分策略

自动切分是本项目的关键。目标不是让用户手动切分，而是让系统生成一个足够好的初稿，再让用户只处理少量不确定情况。

### 9.1 PPT/课件切分

PPT 或由 PPT 导出的 PDF 通常以 slide 为天然单位。默认策略是：

```text
1. 每一页 slide 先生成一个候选 block
2. 如果连续几页标题相同或主题高度相似，则合并
3. 如果一页中包含多个明显主题，例如定义 + 例题 + 证明，则可以拆分
4. 如果某页只是过渡页、目录页或总结页，可以标记为 meta block
```

### 9.2 论文切分

论文切分优先遵守原文结构。默认策略是：

```text
1. 按 section / subsection / paragraph 初步切分
2. Abstract、Introduction、Related Work、Method、Experiment、Conclusion 分别处理
3. 定理、引理、证明、算法框、实验表格、图注可单独成 block
4. 如果一个 subsection 太长，则按公式、段落主题或图表进一步拆分
5. 如果一个公式后面有连续解释，则公式和解释应尽量保留在同一个 block
```

### 9.3 数学讲义切分

数学讲义需要特别保留推导链条。默认策略是：

```text
1. 定义单独成 block
2. 定理与证明可以先放同一 block，若证明很长则拆为 theorem block 和 proof block
3. 关键公式变形应尽量保持连续
4. 例题与解法应放在同一 block
5. 用户聊天中反复追问的地方应提高 block 粒度
```

### 9.4 代码讲解切分

如果材料是代码文件或代码论文复现记录，默认策略是：

```text
1. 按文件、类、函数、主流程切分
2. 每个 block 需要保留代码路径和行号范围
3. AI 讲解需要包含该代码在数学或论文中的对应意义
4. 后续问题应挂到具体函数或模块，而不是整份代码
```

---

## 10. 聊天记录解析策略

聊天记录解析要支持两种输入。

第一种是 ChatGPT 导出的 JSON。它可能包含对话标题、创建时间、消息角色、消息正文等结构化信息。系统应尽量保留这些结构。

第二种是用户复制出来的纯文本。纯文本没有可靠结构，系统需要用启发式规则识别 user 和 assistant 的轮次。如果识别失败，就把整段作为 unknown dialogue 保存，等待 Agent 或用户确认。

解析聊天时需要特别识别以下模式：

```text
“请继续”
“好，继续”
“我理解了”
“这里我没懂”
“回到论文这里”
“从这个位置重新开始”
“你刚才说的……”
“为什么……”
“能不能详细推导……”
“请证明……”
“请总结……”
```

这些语句本身不一定是学习内容，但它们提供了顺序线索和依赖关系。尤其是“请继续”表示聊天顺序大概率沿着原文顺序推进；“回到论文这里”表示之后的内容应重新对齐到某个原文位置；“我没懂”表示该 block 需要补充解释或标记难点。

---

## 11. 聊天到 block 的对齐策略

对齐不应只靠关键词。建议综合使用以下信号：

```text
1. 时间顺序：聊天通常沿原文顺序推进
2. 主题关键词：标题、术语、公式名、算法名
3. 页码线索：用户或 AI 是否提到第几页、某图、某定理
4. 公式相似度：聊天中的 LaTeX 与原文公式是否相近
5. 语义相似度：聊天内容与 source.md 的 embedding 相似度
6. 控制语句：请继续、回到这里、先停一下、重新开始
7. 课程上下文：当前聊天是否明确属于某门课或某篇论文
```

对齐结果必须有置信度。高置信度可以自动写入；中置信度写入 proposed 文件；低置信度进入 unresolved 队列。

建议阈值：

```text
confidence >= 0.85: 自动归档
0.60 <= confidence < 0.85: 生成 proposed，需要用户确认
confidence < 0.60: 放入 unresolved.json
```

---

## 12. Agent 工作规范

本项目中的 Agent 应遵守以下原则。

Agent 不应直接覆盖用户已有内容，除非命令明确要求覆盖。任何重写都应先生成 proposed 文件或 patch。

Agent 不应删除原始材料。raw 文件夹中的 PDF、PPT、DOCX、图片等都应视为只读。

Agent 不应把原始聊天记录原封不动塞进 explanation.mdx。聊天记录必须被整理为教材式讲解，追问内容应变成补充解释或融入主线。

Agent 需要保留出处。每个 explanation 都应该知道自己对应哪个 source、哪几页、哪个 block。后续如果用户发现解释有误，可以追溯回原文。

Agent 遇到不确定对齐时，不要强行猜测。它应该生成 unresolved 项，说明可能候选 block 和不确定原因。

Agent 写数学解释时必须保留 LaTeX 格式。行内公式使用 `$...$`，块级公式使用 `$$...$$`。

Agent 写代码解释时必须保留文件路径、函数名、关键变量和流程关系。

Agent 修改 content 后，应运行 validate 命令检查链接、id、schema、资源路径是否正确。

---

## 13. 网站功能规划

### 13.1 MVP 页面

第一版网站必须包含：

```text
1. 首页：展示课程、论文、最近学习内容
2. 课程页：展示该课程下的讲义和学习进度
3. 文档页：展示一份讲义或论文的 block 列表
4. Block 阅读页：左右对照原文和讲解
5. 问题输入框：在 block 下新增问题
6. Prompt packet 导出：复制给 ChatGPT
7. Patch 列表：显示该 block 的补充解释
```

### 13.2 左右对照阅读器

Block 阅读页应采用左右分栏布局。

```text
左侧 SourcePane:
- 显示原文页图
- 显示页码
- 显示原文摘录
- 支持切换 page_start 到 page_end
- 支持放大图片

右侧 ExplanationPane:
- 显示 explanation.mdx
- 显示 questions.md
- 显示 patches
- 显示相关 block
- 显示理解状态
```

### 13.3 追问与补丁流程

用户在网页上写问题后，系统生成 question yml：

```yaml
id: 2026-06-09-question-001
target_block: opt-newton-003
question: 为什么 Hessian 正定能推出 Newton 方向是下降方向？
status: pending
created_at: 2026-06-09
```

然后生成 prompt packet。用户把 prompt packet 复制给 ChatGPT。拿到回答后，用户复制回网站或放入 inbox/ai_responses。系统把它变成 patch。

### 13.4 搜索

第一版可以做关键词搜索。第二版再做语义搜索。

搜索结果应显示：

```text
block 标题
所属课程或论文
页码
相关标签
匹配片段
是否已理解
是否有未解决问题
```

### 13.5 概念图

后续版本可以从 blocks 中抽取 concepts，生成概念图。

例如：

```text
梯度下降 -> 线搜索 -> 回溯线搜索 -> Armijo 条件
牛顿法 -> Hessian -> 二次近似 -> 下降方向
拟牛顿 -> 割线方程 -> DFP -> BFGS
```

---

## 14. 开发里程碑

### Milestone 0: 仓库骨架

目标：建立项目结构，能放材料，能运行空网站。

完成标准：

```text
1. content、inbox、scripts、site、data、prompts 目录存在
2. README.md 和 AGENTS.md 存在
3. Next.js 网站能启动
4. 首页能读取 mock content
```

### Milestone 1: PDF/PPT 导入

目标：把原始材料变成可处理内容。

完成标准：

```text
1. PDF 可以复制进 content
2. PDF 每页可以渲染为 PNG
3. PDF 文本可以提取为 pages.json 和 fulltext.md
4. PPTX 可以先转 PDF 或直接提取文本
5. source.yml 自动生成
```

### Milestone 2: 自动切分 blocks

目标：不让用户手动切分。

完成标准：

```text
1. PPT/PDF 可以生成初步 block
2. 每个 block 有 block.yml 和 source.md
3. 每个 block 有 page_start、page_end、title、order
4. 切分结果有 confidence
5. 低置信度 block 会进入 review 报告
```

### Milestone 3: 阅读网站

目标：可以对照原文和 AI 讲解。

完成标准：

```text
1. 课程页可浏览
2. 文档页可浏览
3. Block 页可左右对照显示
4. MDX 讲解可以渲染
5. 数学公式可以正常显示
6. Patch 和 questions 可以显示
```

### Milestone 4: 聊天记录解析

目标：导入 ChatGPT 文字或 JSON 聊天记录。

完成标准：

```text
1. 支持 JSON 聊天导入
2. 支持 txt/md 纯文本聊天导入
3. 能区分 user / assistant turns
4. 能识别学习控制语句
5. 输出标准 dialogue.json
```

### Milestone 5: 聊天对齐到 blocks

目标：把旧聊天记录自动归位。

完成标准：

```text
1. 能根据文本相似度和顺序线索匹配 block
2. 高置信度问答自动写入 explanation 或 patch
3. 中置信度问答写入 proposed
4. 低置信度问答进入 unresolved
5. 用户可以在 review 报告中快速确认
```

### Milestone 6: 追问导出与补丁导入

目标：支持学习过程中持续补充。

完成标准：

```text
1. 用户可在网页对 block 提问
2. 系统可生成 prompt packet
3. 用户可复制 AI 回答回项目
4. 系统可生成 patch
5. patch 可显示在 block 页面
6. patch 可选择合并进主讲解
```

### Milestone 7: 搜索与概念图

目标：让复习和查找变容易。

完成标准：

```text
1. 可以按标题、标签、正文搜索
2. 可以按课程、论文、状态筛选
3. 可以展示相关 block
4. 可以生成 concepts.json
5. 可以初步展示概念关系
```

---

## 15. README 给 Agent 的开发优先级

如果 Agent 第一次读取本 README，应按以下顺序开发，不要跳到后期功能。

第一优先级是文件系统结构和 schema。没有稳定内容结构，后续网站和 Agent 都会混乱。

第二优先级是 PDF/PPT 导入。必须先把原文变成页图和文本。

第三优先级是 block 自动切分。即使切分不完美，也要先形成 block。

第四优先级是左右对照网站。只要这个完成，项目就已经能开始真实使用。

第五优先级是聊天记录解析与对齐。这个功能复杂，可以逐步增强。

第六优先级是追问、patch、合并。它决定项目是否能长期滚动生长。

第七优先级才是搜索、embedding、概念图、复习系统。

---

## 16. MVP 实现建议

MVP 不要求一次性完美。最小可用版本应该只做以下事情：

```text
1. 用户把 PDF 放入 inbox/raw
2. 运行 ingest，生成页面图片和文本
3. 运行 segment，生成 blocks
4. 用户把已有 ChatGPT 聊天文本放入 inbox/chats
5. 运行 align-chat，尽量把聊天内容归到 blocks
6. 网站展示 block 左右对照页面
7. 用户可以手动修正 block 标题和少量错配
```

MVP 可以暂时不做数据库、不做登录、不做云同步、不做复杂权限、不做在线 LLM API 调用。用户可以继续手动把 prompt packet 复制给 ChatGPT，再把回答复制回来。

这样设计的好处是，用户不需要暴露所有资料给外部服务，也不需要一开始处理复杂 API 权限。项目可以先作为本地个人学习工具运行。

---

## 17. 后续增强方向

后续可以逐步增加以下功能：

```text
1. 自动调用 LLM API 完成切分、对齐和重写
2. 支持拖拽上传材料
3. 支持 ChatGPT export.zip 直接导入
4. 支持 Obsidian 导出或同步
5. 支持 Anki 卡片生成
6. 支持复习计划和理解状态追踪
7. 支持公式索引
8. 支持代码仓库与论文 block 对齐
9. 支持多版本讲解，例如“直觉版”“严格证明版”“复习速记版”
10. 支持跨课程概念图
```

---

## 18. 风险与注意事项

自动切分不会一开始就完美。数学材料、扫描版 PDF、复杂 PPT、带大量公式的论文都会让文本提取变差。因此系统必须允许 proposed、unresolved 和人工确认，而不是假装全自动永远正确。

聊天记录对齐也不会一开始就完美。尤其是用户经常追问、跳转、回到前文时，聊天顺序和原文顺序会错开。因此系统必须保留对齐置信度，并允许用户修正。

AI 讲解可能出错。项目应保留原文出处和历史 patch，不能让错误解释悄悄覆盖原文或旧版本。

不要把项目做成聊天软件。聊天软件已经有 ChatGPT。这个项目的价值是整理、归档、对照、复习和重构。

---

## 19. 推荐的第一周开发计划

第一天，建立仓库骨架，写好 schema，创建一个 mock course、mock lecture、mock block。

第二天，实现 PDF 导入，至少能把每页渲染成图片，并生成 source.yml。

第三天，实现初版 segment。规则可以很简单：PPT 每页一个 block，论文按标题或页码切，讲义按页或连续标题切。

第四天，实现 Next.js block 阅读页。左边显示 page PNG，右边显示 explanation.mdx。

第五天，实现聊天纯文本解析。先不用完美，只要能把用户消息和 AI 消息拆开。

第六天，实现最简单的 align-chat。先用顺序和关键词，不急着上 embedding。

第七天，用一份真实讲义和一段真实 ChatGPT 聊天记录测试整个流程，记录失败案例，再决定下一步优化方向。

---

## 20. 项目成功标准

项目成功不是指自动化程度达到百分之百，而是指用户在真实学习时明显减少整理负担。

第一阶段成功标准：

```text
用户能把一份讲义和对应聊天记录放进项目，半小时内得到一个可浏览的左右对照网站。
```

第二阶段成功标准：

```text
用户后续追问某个旧知识点时，回答能被挂回正确 block，而不是堆在聊天末尾。
```

第三阶段成功标准：

```text
用户复习一门课时，可以按照课程结构阅读原文、AI 讲解、补充解释和自己的问题，而不需要翻聊天记录。
```

第四阶段成功标准：

```text
用户可以跨课程搜索概念，例如搜索“Armijo 条件”“bootstrap CI”“BFGS 更新”，立刻找到原文、讲解、追问和相关 block。
```

---

## 21. 给未来 Agent 的一句话总结

请把这个项目理解为“把 AI 学习聊天重构成结构化个人教材”的系统。不要把聊天记录当成最终产品。最终产品是围绕原文 block 组织的、可对照阅读、可持续补丁更新、可搜索复习的学习知识库。
