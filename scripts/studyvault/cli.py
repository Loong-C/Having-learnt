"""AI Study Vault - Content Processing CLI"""

import typer
from rich.console import Console

app = typer.Typer(name="studyvault", help="AI Study Vault content processing tools")
console = Console()


@app.command()
def ingest_pdf(pdf_path: str, output_dir: str = "content"):
    """Ingest a PDF: extract pages as images and text."""
    console.print(f"[bold green]Ingesting PDF:[/] {pdf_path}")
    console.print("[yellow]This command requires PyMuPDF. Install with: pip install PyMuPDF[/]")


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
