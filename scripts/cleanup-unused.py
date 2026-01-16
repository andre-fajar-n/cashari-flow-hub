#!/usr/bin/env python3
"""
Cleanup Unused Files - Cashari Flow Hub
This script analyzes the project's dependency graph to find and optionally delete unused TypeScript/TSX files.

Usage:
  python3 cleanup-unused.py          # Dry run: just list unused files
  python3 cleanup-unused.py --delete # Delete the unused files
"""

import os
import re
import sys
import argparse
from pathlib import Path
from typing import Set

# Configuration
SRC_DIR = Path("src")
ENTRY_POINTS = [
    "src/main.tsx",
    "src/App.tsx",
]
# Files that should never be deleted automatically
EXCLUDE_FROM_DELETION = {
    "src/vite-env.d.ts",
}

def get_all_ts_files(directory: Path) -> Set[Path]:
    """Get all TypeScript/TSX files in directory."""
    files = set()
    for ext in ["*.ts", "*.tsx"]:
        files.update(directory.rglob(ext))
    return files

def extract_imports(file_path: Path) -> Set[str]:
    """Extract all import and export paths from a file."""
    try:
        content = file_path.read_text(encoding='utf-8')
    except Exception as e:
        print(f"⚠️  Error reading {file_path}: {e}")
        return set()
    
    paths = set()
    
    # Match import/export statements, including multi-line ones
    # Supports:
    # import ... from "path"
    # export ... from "path"
    # import "path"
    # dynamic import("path")
    patterns = [
        r'(?:import|export)\s+(?:[^"\']*)\s+from\s+["\']([^"\']+)["\']',
        r'import\s+["\']([^"\']+)["\']',
        r'import\s*\(\s*["\']([^"\']+)["\']\s*\)',
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, content, re.DOTALL)
        paths.update(matches)
    
    return paths

def resolve_import(import_path: str, from_file: Path) -> Path | None:
    """Resolve an import path to an actual file."""
    if not (import_path.startswith('.') or import_path.startswith('@/')):
        return None
    
    if import_path.startswith('@/'):
        # Handle @/ alias (maps to src/)
        resolved = SRC_DIR / import_path[2:]
    else:
        # Relative import
        resolved = from_file.parent / import_path
    
    # Normalize path (handle ../ and ./)
    resolved = Path(os.path.normpath(str(resolved)))
    
    # Try different extensions
    for ext in ['', '.ts', '.tsx', '.js', '.jsx']:
        test_path = Path(str(resolved) + ext)
        if test_path.is_file():
            return test_path
    
    # Try index files
    for ext in ['.ts', '.tsx', '.js', '.jsx']:
        index_path = resolved / f"index{ext}"
        if index_path.is_file():
            return index_path
    
    return None

def analyze_dependencies(all_files: Set[Path]) -> Set[Path]:
    """Trace dependencies starting from entry points."""
    used_files: Set[Path] = set()
    queue = [Path(ep) for ep in ENTRY_POINTS if Path(ep).exists()]
    
    while queue:
        file_path = queue.pop(0)
        if file_path in used_files:
            continue
            
        used_files.add(file_path)
        
        imports = extract_imports(file_path)
        for imp in imports:
            resolved = resolve_import(imp, file_path)
            if resolved and resolved in all_files and resolved not in used_files:
                queue.append(resolved)
                
    return used_files

def main():
    parser = argparse.ArgumentParser(description="Cleanup unused TypeScript files.")
    parser.add_argument("--delete", action="store_true", help="Delete unused files instead of just listing them")
    args = parser.parse_args()

    if not SRC_DIR.exists():
        print(f"❌ Error: {SRC_DIR} directory not found.")
        sys.exit(1)

    print("🔍 Analyzing project dependencies...")
    
    all_files = get_all_ts_files(SRC_DIR)
    used_files = analyze_dependencies(all_files)
    unused_files = sorted(all_files - used_files)
    
    if not unused_files:
        print("✅ No unused files found!")
        return

    print(f"\n📊 Found {len(unused_files)} unused files:")
    for f in unused_files:
        status = "[SKIP]" if str(f) in EXCLUDE_FROM_DELETION else ""
        print(f"  - {f} {status}")

    if args.delete:
        print("\n🗑️  Deleting files...")
        deleted_count = 0
        for f in unused_files:
            if str(f) not in EXCLUDE_FROM_DELETION:
                try:
                    f.unlink()
                    deleted_count += 1
                except Exception as e:
                    print(f"  ❌ Failed to delete {f}: {e}")
        
        # Clean up empty directories
        print("📁 Cleaning up empty directories...")
        for root, dirs, files in os.walk(SRC_DIR, topdown=False):
            for name in dirs:
                dir_path = os.path.join(root, name)
                if not os.listdir(dir_path):
                    os.rmdir(dir_path)
                    
        print(f"\n✅ Build cleanup complete! Deleted {deleted_count} files.")
    else:
        print("\n💡 Run with --delete to remove these files.")

if __name__ == "__main__":
    main()
