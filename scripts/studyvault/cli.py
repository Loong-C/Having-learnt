"""AI Study Vault - Content Processing CLI"""

import typer
from rich.console import Console

app = typer.Typer(name="studyvault", help="AI Study Vault content processing tools")
console = Console()


@app.command()
def ingest_pdf(pdf_path: str, output_dir: str = "content"):
    """Ingest a PDF: extract pages as images."""
    import subprocess
    import sys
    from pathlib import Path

    project_root = Path(__file__).resolve().parent.parent.parent
    render_script = project_root / "scripts" / "render_pdf.py"

    console.print(f"[bold green]Rendering PDF pages:[/] {pdf_path}")
    result = subprocess.run(
        [sys.executable, str(render_script), "--pdf", pdf_path],
        cwd=str(project_root),
    )
    if result.returncode == 0:
        console.print("[bold green]✅ PDF pages rendered successfully[/]")
    else:
        console.print("[bold red]❌ PDF rendering failed[/]")


@app.command()
def ingest_chat(chat_path: str, output_dir: str = "content"):
    """Parse a chat export and split into dialogue segments."""
    console.print(f"[bold green]Parsing chat:[/] {chat_path}")


@app.command()
def build_index(content_dir: str = "content", output_dir: str = "data/indexes"):
    """Build search index from all block content."""
    console.print("[bold green]Building search index...[/]")


@app.command()
def validate(content_dir: str = "content"):
    """Validate all content files for consistency."""
    console.print("[bold green]Validating content...[/]")


if __name__ == "__main__":
    app()
