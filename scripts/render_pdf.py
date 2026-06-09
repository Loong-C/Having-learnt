"""Render PDF pages to PNG images for the block reader.

Usage:
    python scripts/render_pdf.py
    python scripts/render_pdf.py --pdf "inbox/raw/optimization/xxx.pdf" --lecture lecture-07-gradient-descent
"""

import argparse
import sys
from pathlib import Path

import fitz  # PyMuPDF


def parse_pages_range(pages_str: str) -> list[int]:
    """Parse a pages range like '2-6' or '7' into a list of page numbers."""
    pages_str = pages_str.strip()
    if "-" in pages_str:
        parts = pages_str.split("-")
        start, end = int(parts[0]), int(parts[1])
        return list(range(start, end + 1))
    else:
        return [int(pages_str)]


def render_pdf(pdf_path: Path, lecture_id: str, output_dir: Path, dpi: int = 200):
    """Render all pages of a PDF to PNG images.

    Args:
        pdf_path: Path to the PDF file.
        lecture_id: Lecture identifier (e.g. 'lecture-07-gradient-descent').
        output_dir: Root output directory (e.g. 'public/pages').
        dpi: Resolution in DPI for rendering.
    """
    if not pdf_path.exists():
        print(f"❌ PDF not found: {pdf_path}")
        sys.exit(1)

    doc = fitz.open(str(pdf_path))
    total_pages = len(doc)
    print(f"📄 PDF: {pdf_path.name}")
    print(f"   Pages: {total_pages}")

    # Create output directory
    pages_dir = output_dir / lecture_id
    pages_dir.mkdir(parents=True, exist_ok=True)

    zoom = dpi / 72  # PyMuPDF default is 72 DPI
    mat = fitz.Matrix(zoom, zoom)

    for i, page in enumerate(doc):
        page_num = i + 1  # 1-indexed
        pix = page.get_pixmap(matrix=mat)
        output_path = pages_dir / f"page-{page_num:02d}.png"
        pix.save(str(output_path))
        print(f"   ✅ Page {page_num:2d}/{total_pages} → {output_path.name}")

    doc.close()
    print(f"\n✅ Done! {total_pages} pages rendered to {pages_dir}")
    print(f"   URL prefix: /pages/{lecture_id}/")
    return total_pages


def main():
    parser = argparse.ArgumentParser(
        description="Render PDF pages to PNG images for AI Study Vault"
    )
    parser.add_argument(
        "--pdf",
        default="inbox/raw/optimization/Optimization_lecture_7_2026_Gradient descent methods.pdf",
        help="Path to the PDF file",
    )
    parser.add_argument(
        "--lecture",
        default="lecture-07-gradient-descent",
        help="Lecture ID for output subdirectory",
    )
    parser.add_argument(
        "--output",
        default="public/pages",
        help="Output directory for rendered pages",
    )
    parser.add_argument(
        "--dpi",
        type=int,
        default=200,
        help="Rendering resolution in DPI (default: 200)",
    )

    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    pdf_path = project_root / args.pdf
    output_dir = project_root / args.output

    render_pdf(pdf_path, args.lecture, output_dir, args.dpi)


if __name__ == "__main__":
    main()
