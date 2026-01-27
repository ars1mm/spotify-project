"""
Codebase Search Service
Provides regex-supported search functionality across the codebase.
"""
import os
import re
from typing import List, Dict, Optional
from pathlib import Path


class CodebaseSearchService:
    """Service for searching code files with regex support."""
    
    # File extensions to search
    SEARCHABLE_EXTENSIONS = {
        '.py', '.js', '.jsx', '.ts', '.tsx', 
        '.html', '.css', '.scss', '.json', 
        '.md', '.yml', '.yaml', '.sql',
        '.env.example', '.txt'
    }
    
    # Directories to exclude from search
    EXCLUDED_DIRS = {
        'node_modules', '.git', '__pycache__', 
        '.next', 'dist', 'build', '.venv', 
        'venv', 'env', '.pytest_cache',
        '.vercel', 'coverage', '.nyc_output'
    }
    
    def __init__(self, base_path: str = None):
        """
        Initialize the search service.
        
        Args:
            base_path: Root directory of the project. Defaults to project root.
        """
        if base_path is None:
            # Navigate up from current file to project root
            current_dir = Path(__file__).resolve().parent
            # Go up: codebase -> services -> app -> backend -> project_root
            self.base_path = current_dir.parent.parent.parent.parent
        else:
            self.base_path = Path(base_path)
    
    def _should_search_file(self, file_path: Path) -> bool:
        """Check if a file should be included in search."""
        # Check extension
        suffix = file_path.suffix.lower()
        if suffix not in self.SEARCHABLE_EXTENSIONS:
            # Special handling for files without extension (like Dockerfile)
            if file_path.name in ['Dockerfile', 'Makefile', '.gitignore', '.dockerignore']:
                return True
            return False
        
        # Check if any parent directory is excluded
        for part in file_path.parts:
            if part in self.EXCLUDED_DIRS:
                return False
        
        return True
    
    def _get_all_searchable_files(self) -> List[Path]:
        """Get all searchable files in the project."""
        files = []
        for root, dirs, filenames in os.walk(self.base_path):
            # Remove excluded directories from walk
            dirs[:] = [d for d in dirs if d not in self.EXCLUDED_DIRS]
            
            for filename in filenames:
                file_path = Path(root) / filename
                if self._should_search_file(file_path):
                    files.append(file_path)
        
        return files
    
    def search(
        self, 
        pattern: str, 
        case_sensitive: bool = False,
        file_filter: Optional[str] = None,
        max_results: int = 100,
        context_lines: int = 2
    ) -> Dict:
        """
        Search the codebase using a regex pattern.
        
        Args:
            pattern: Regex pattern to search for
            case_sensitive: Whether search is case-sensitive
            file_filter: Optional regex to filter file paths
            max_results: Maximum number of matches to return
            context_lines: Number of context lines around matches
            
        Returns:
            Dictionary with search results
        """
        results = {
            "pattern": pattern,
            "case_sensitive": case_sensitive,
            "file_filter": file_filter,
            "total_matches": 0,
            "files_searched": 0,
            "files_matched": 0,
            "matches": [],
            "error": None
        }
        
        try:
            # Compile the search pattern
            flags = 0 if case_sensitive else re.IGNORECASE
            try:
                search_regex = re.compile(pattern, flags)
            except re.error as e:
                results["error"] = f"Invalid regex pattern: {str(e)}"
                return results
            
            # Compile file filter if provided
            file_regex = None
            if file_filter:
                try:
                    file_regex = re.compile(file_filter, re.IGNORECASE)
                except re.error as e:
                    results["error"] = f"Invalid file filter regex: {str(e)}"
                    return results
            
            files = self._get_all_searchable_files()
            results["files_searched"] = len(files)
            
            for file_path in files:
                # Apply file filter
                relative_path = str(file_path.relative_to(self.base_path))
                if file_regex and not file_regex.search(relative_path):
                    continue
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        lines = content.splitlines()
                except Exception:
                    continue
                
                file_matches = []
                for i, line in enumerate(lines):
                    if search_regex.search(line):
                        # Get context
                        start = max(0, i - context_lines)
                        end = min(len(lines), i + context_lines + 1)
                        
                        context = []
                        for j in range(start, end):
                            context.append({
                                "line_number": j + 1,
                                "content": lines[j],
                                "is_match": j == i
                            })
                        
                        file_matches.append({
                            "line_number": i + 1,
                            "content": line,
                            "context": context
                        })
                        
                        results["total_matches"] += 1
                        
                        if results["total_matches"] >= max_results:
                            break
                
                if file_matches:
                    results["files_matched"] += 1
                    results["matches"].append({
                        "file": relative_path,
                        "matches": file_matches
                    })
                
                if results["total_matches"] >= max_results:
                    break
            
        except Exception as e:
            results["error"] = str(e)
        
        return results
    
    def get_file_content(self, relative_path: str) -> Dict:
        """
        Get the content of a specific file.
        
        Args:
            relative_path: Path relative to project root
            
        Returns:
            Dictionary with file content or error
        """
        try:
            file_path = self.base_path / relative_path
            
            # Security check - ensure path is within project
            if not str(file_path.resolve()).startswith(str(self.base_path.resolve())):
                return {"error": "Access denied: Path outside project"}
            
            if not file_path.exists():
                return {"error": "File not found"}
            
            if not file_path.is_file():
                return {"error": "Not a file"}
            
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            return {
                "file": relative_path,
                "content": content,
                "lines": len(content.splitlines()),
                "size": file_path.stat().st_size
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def get_project_structure(self, max_depth: int = 4) -> Dict:
        """
        Get the project directory structure.
        
        Args:
            max_depth: Maximum directory depth to traverse
            
        Returns:
            Dictionary representing directory tree
        """
        def build_tree(path: Path, depth: int = 0) -> Dict:
            if depth >= max_depth:
                return {"name": "...", "type": "truncated"}
            
            result = {
                "name": path.name or str(path),
                "type": "directory" if path.is_dir() else "file",
            }
            
            if path.is_dir():
                children = []
                try:
                    for child in sorted(path.iterdir()):
                        if child.name in self.EXCLUDED_DIRS:
                            continue
                        if child.name.startswith('.') and child.name not in ['.env.example', '.gitignore']:
                            continue
                        children.append(build_tree(child, depth + 1))
                except PermissionError:
                    pass
                result["children"] = children
            else:
                result["size"] = path.stat().st_size if path.exists() else 0
            
            return result
        
        return build_tree(self.base_path)
