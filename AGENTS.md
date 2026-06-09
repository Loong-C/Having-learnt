# AI Study Vault - Agent Instructions

This project is a personal knowledge website for structured learning.

## Project Principles

1. **Original material is the skeleton**, not chat history
2. **Minimum learning unit = block**, each with a stable ID
3. **Chat records are raw ingredients** that must be parsed, segmented, aligned, and rewritten
4. **Left-right reading**: original on left, AI explanation on right
5. **Content as filesystem**: YAML for metadata, MDX for explanations, JSON for indexes

## When Adding New Content

1. Place raw materials in `inbox/raw/` and chat exports in `inbox/chats/`
2. Run ingest scripts to process PDFs into pages
3. Run segment scripts to create blocks
4. Run align scripts to map chat content to blocks
5. Run index scripts to rebuild search
6. Review uncertain alignments manually

## File Types

- `*.yml` - Metadata (course, lecture, block info)
- `*.mdx` - AI explanations with KaTeX math and custom components
- `*.md` - Source text extracts and questions
- `*.json` - Index files and search data

## Components Available in MDX

- `<Callout type="info|warning|check">` - Highlighted callout boxes
- `<Theorem title="...">` - Theorem blocks
- `<Proof>` - Collapsible proof blocks
