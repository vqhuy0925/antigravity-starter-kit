#!/usr/bin/env python3
"""
generate_llmstxt.py - Generates /llms.txt conforming to the llmstxt.org standard.
Scans local docs/workspace or sitemap to generate clean markdown for LLM ingestion.
"""

import os
import sys
import argparse
from pathlib import Path

def extract_frontmatter_or_title(file_path: Path):
    title = file_path.stem.replace('-', ' ').replace('_', ' ').title()
    desc = ""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()[:25]
            in_frontmatter = False
            for line in lines:
                sline = line.strip()
                if sline == '---':
                    in_frontmatter = not in_frontmatter
                    continue
                if in_frontmatter:
                    if sline.startswith('description:'):
                        desc = sline.replace('description:', '').strip(' "\'')
                    elif sline.startswith('title:'):
                        title = sline.replace('title:', '').strip(' "\'')
                else:
                    if sline.startswith('# ') and not in_frontmatter:
                        title = sline[2:].strip()
                        break
    except Exception:
        pass
    return title, desc

def generate_llms_txt(project_name: str, base_url: str, docs_dir: str, output_path: str = "llms.txt"):
    docs_path = Path(docs_dir)
    if not docs_path.exists():
        print(f"Error: Directory '{docs_dir}' does not exist.")
        sys.exit(1)

    items = []
    for root, _, files in os.walk(docs_path):
        for file in sorted(files):
            if file.endswith(('.md', '.mdx', '.html')) and not file.startswith('llms'):
                full_path = Path(root) / file
                rel_path = full_path.relative_to(docs_path).as_posix()
                title, desc = extract_frontmatter_or_title(full_path)
                url = f"{base_url.rstrip('/')}/{rel_path}"
                items.append({
                    "title": title,
                    "url": url,
                    "desc": desc or f"Overview and documentation for {title}"
                })

    content = []
    content.append(f"# {project_name}\n")
    content.append(f"> Curated documentation and system references for AI agents, search engines, and LLM indexing.\n")
    content.append(f"## Core Documentation\n")

    for item in items:
        content.append(f"- [{item['title']}]({item['url']}): {item['desc']}")

    content.append("\n## Optional\n")
    content.append(f"- [Full Context Archive]({base_url.rstrip('/')}/llms-full.txt): Complete uncompressed documentation bundle.")

    final_text = "\n".join(content) + "\n"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(final_text)

    print(f"Successfully generated {output_path} with {len(items)} documentation links.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate llms.txt according to llmstxt.org specification.")
    parser.add_argument("--name", default="Project Documentation", help="Project or Website Name")
    parser.add_argument("--url", default="https://example.com/docs", help="Base URL for documentation")
    parser.add_argument("--dir", default=".", help="Directory containing markdown/docs")
    parser.add_argument("--output", default="llms.txt", help="Output path for llms.txt")

    args = parser.parse_args()
    generate_llms_txt(args.name, args.url, args.dir, args.output)
