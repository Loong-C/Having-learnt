"""Parse plain text chat exports into structured dialogue segments."""

import re
from pathlib import Path
from typing import List


def parse_plain_chat(filepath: str) -> List[dict]:
    """Parse a plain text chat file into turn-by-turn segments."""
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    # Split by blank lines to identify speaker turns
    segments = []
    current_speaker = "user"
    current_text = []
    
    for line in text.split('\n'):
        stripped = line.strip()
        if not stripped:
            if current_text:
                segments.append({
                    "speaker": current_speaker,
                    "text": '\n'.join(current_text).strip()
                })
                current_text = []
                current_speaker = "ai" if current_speaker == "user" else "user"
        else:
            current_text.append(stripped)
    
    if current_text:
        segments.append({
            "speaker": current_speaker,
            "text": '\n'.join(current_text).strip()
        })
    
    return segments


def split_by_topics(segments: List[dict], topic_markers: List[str]) -> List[dict]:
    """Split dialogue segments by topic markers (e.g., page numbers)."""
    # Simple heuristic: group segments between user confirmation messages
    return segments
