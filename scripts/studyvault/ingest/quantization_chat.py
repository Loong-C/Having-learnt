"""
Parse the quantization paper chat log and generate MDX files for each block.
Improved v2: proper multi-line display math and $$ protection.
"""
import re
import os

CHAT_PATH = "f:/Personal/Code/having learnt/inbox/chats/量化论文逐步讲解.txt"
BLOCKS_DIR = "f:/Personal/Code/having learnt/content/courses/quantization-theory/lectures/lecture-01-randomized-hadamard-quantization/blocks"

BLOCKS = [
    ("qt-rhq-001", 1, 180, "论文总览与提纲"),
    ("qt-rhq-002", 181, 815, "量化基础概念"),
    ("qt-rhq-003", 816, 1115, "Algorithm 1 流程与设计"),
    ("qt-rhq-004", 1116, 1513, "Gaussian 标量量化器与 F 函数"),
    ("qt-rhq-005", 1514, 1591, "随机旋转与 Dithering 深入"),
    ("qt-rhq-006", 1592, 1977, "高维到标量的误差归约"),
    ("qt-rhq-007", 1978, 2888, "Lemma 3.1 中心-尾部证明"),
    ("qt-rhq-008", 2889, 3336, "完整证明与 Algorithm 5 无偏修正"),
    ("qt-rhq-009", 3337, 3646, "内积量化器 Section 4"),
]

SHORT_USER_PATTERNS = [
    r'^我懂了[，,]\s*我们继续.*$',
    r'^好[，,]\s*请继续.*$',
    r'^这次我理解了[，,].*$',
    r'^你可以开始[。.]?.*$',
    r'^请继续.*$',
    r'^好[，,]\s*我们现在.*$',
    r'^OK[，,].*$',
    r'^ok[，,].*$',
    r'^明白了[。.]?$',
    r'^可以[。.]?$',
    r'^好[。.]?$',
]

def has_math_content(s):
    """Return True if string has math indicators and not mainly Chinese."""
    chinese = sum(1 for c in s if '\u4e00' <= c <= '\u9fff')
    if chinese > 2:
        return False
    math_chars = set('\\_^=+-*/~<>|')
    if any(c in s for c in math_chars):
        return True
    if re.search(r'[a-zA-Z0-9]', s):
        return True
    return False

def convert_display_math(text):
    """Convert multi-line [...] blocks to $$...$$."""
    lines = text.split('\n')
    result = []
    in_display = False
    display_lines = []

    for line in lines:
        stripped = line.strip()

        if in_display:
            if stripped == ']':
                content = '\n'.join(display_lines).strip()
                if content:
                    result.append('$$\n' + content + '\n$$')
                display_lines = []
                in_display = False
            elif stripped == '[':
                display_lines.append(line)
            else:
                display_lines.append(line)
            continue

        # Single-line [...]
        if stripped.startswith('[') and stripped.endswith(']') and len(stripped) > 2:
            inner = stripped[1:-1].strip()
            if inner and has_math_content(inner):
                result.append('$$\n' + inner + '\n$$')
                continue

        # Start of multi-line display math
        if stripped == '[':
            in_display = True
            display_lines = []
            continue

        result.append(line)

    if in_display:
        for l in display_lines:
            result.append(l)

    return '\n'.join(result)

def convert_inline_math_outside_dollars(text):
    """Convert (...) to $...$ only outside $$...$$ blocks."""
    parts = re.split(r'(\$\$.*?\$\$)', text, flags=re.DOTALL)
    result = []
    for i, part in enumerate(parts):
        if i % 2 == 1:
            result.append(part)
        else:
            result.append(convert_inline_parens(part))
    return ''.join(result)

def convert_inline_parens(text):
    """Convert inline (...) to $...$ using depth tracking."""
    output = []
    i = 0
    n = len(text)
    while i < n:
        ch = text[i]
        if ch == '(':
            depth = 1
            j = i + 1
            while j < n and depth > 0:
                if text[j] == '(':
                    depth += 1
                elif text[j] == ')':
                    depth -= 1
                j += 1
            if depth == 0:
                inner = text[i+1:j-1]
                if inner and has_math_content(inner):
                    output.append('$' + inner + '$')
                else:
                    output.append('(' + inner + ')')
                i = j
                continue
            else:
                output.append(ch)
        else:
            output.append(ch)
        i += 1
    return ''.join(output)

def convert_math(text):
    """Full conversion: display math first, then inline, then cleanup."""
    text = convert_display_math(text)
    text = convert_inline_math_outside_dollars(text)
    text = re.sub(r'^=+\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^---+\s*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'\$\$\s*\$\$', '', text)
    text = re.sub(r'\n{4,}', '\n\n\n', text)
    return text

def is_short_user_msg(line):
    for p in SHORT_USER_PATTERNS:
        if re.match(p, line.strip()):
            return True
    return False

def process_block(block_id, start_line, end_line):
    with open(CHAT_PATH, 'r', encoding='utf-8') as f:
        all_lines = f.readlines()
    block_lines = all_lines[start_line-1:end_line]
    filtered = []
    for line in block_lines:
        stripped = line.strip()
        if not stripped:
            filtered.append(line)
            continue
        if is_short_user_msg(stripped):
            continue
        if stripped in ('===', '---'):
            continue
        filtered.append(line)
    text = ''.join(filtered)
    text = convert_math(text)
    text = text.strip()
    text = re.sub(r'\n{4,}', '\n\n\n', text)
    mdx_path = os.path.join(BLOCKS_DIR, block_id, 'explanation.mdx')
    with open(mdx_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f"  {block_id}: {len(text)} chars")
    return len(text)

if __name__ == '__main__':
    print("Processing blocks...")
    total = 0
    for bid, start, end, title in BLOCKS:
        print(f"\n{bid} ({title}): lines {start}-{end}")
        total += process_block(bid, start, end)
    print(f"\nDone! {total} chars total.")
