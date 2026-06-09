"""Build search index from content blocks."""

import json
import yaml
from pathlib import Path


def build_search_index(content_dir: str = "content") -> dict:
    """Build a searchable index from all block content."""
    index = {"blocks": [], "courses": [], "lectures": []}
    
    content_path = Path(content_dir)
    
    # Scan courses
    courses_dir = content_path / "courses"
    if courses_dir.exists():
        for course_dir in courses_dir.iterdir():
            if course_dir.is_dir():
                course_yml = course_dir / "course.yml"
                if course_yml.exists():
                    with open(course_yml, 'r', encoding='utf-8') as f:
                        course_data = yaml.safe_load(f)
                        index["courses"].append(course_data)
                
                # Scan lectures
                lectures_dir = course_dir / "lectures"
                if lectures_dir.exists():
                    for lec_dir in lectures_dir.iterdir():
                        if lec_dir.is_dir():
                            source_yml = lec_dir / "source.yml"
                            if source_yml.exists():
                                with open(source_yml, 'r', encoding='utf-8') as f:
                                    lec_data = yaml.safe_load(f)
                                    index["lectures"].append(lec_data)
                            
                            # Scan blocks
                            blocks_dir = lec_dir / "blocks"
                            if blocks_dir.exists():
                                for block_dir in blocks_dir.iterdir():
                                    if block_dir.is_dir():
                                        block_yml = block_dir / "block.yml"
                                        explanation = block_dir / "explanation.mdx"
                                        if block_yml.exists():
                                            with open(block_yml, 'r', encoding='utf-8') as f:
                                                block_data = yaml.safe_load(f)
                                                if explanation.exists():
                                                    with open(explanation, 'r', encoding='utf-8') as ef:
                                                        block_data["explanation_text"] = ef.read()[:1000]
                                                index["blocks"].append(block_data)
    
    return index


def save_index(index: dict, output_path: str = "data/indexes/blocks.json"):
    """Save index to JSON file."""
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(index, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    index = build_search_index()
    save_index(index)
    print(f"Indexed {len(index['blocks'])} blocks, {len(index['lectures'])} lectures, {len(index['courses'])} courses")
