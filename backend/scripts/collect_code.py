import os

def collect_source_code(root_dir, output_file):
    # Directories to ignore
    ignore_dirs = {
        'node_modules', '.next', '.git', '.vercel', '__pycache__', 
        'venv', '.env', 'dokumentimi', 'dist', 'build', '.github',
        'k8s', 'sql' # user said "ignoring config" and "only source code", 
                     # but sql might be source code. I'll include .sql files if found.
    }
    
    # Extensions to include
    include_extensions = {
        '.py', '.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.sql'
    }
    
    # Files to ignore (e.g., the output file itself)
    ignore_files = {
        os.path.basename(output_file),
        'package-lock.json',
        'pnpm-lock.yaml',
        'yarn.lock'
    }
    
    # Specific files to include
    include_files = {
        'Dockerfile', 'docker-compose.yml'
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        for root, dirs, files in os.walk(root_dir):
            # Remove ignored directories from walk
            dirs[:] = [d for d in dirs if d not in ignore_dirs]
            
            for file in files:
                if file in ignore_files or file.endswith('.txt'):
                    continue
                    
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, root_dir)
                
                # Check if file should be included
                ext = os.path.splitext(file)[1].lower()
                if ext in include_extensions or file in include_files:
                    try:
                        with open(file_path, 'r', encoding='utf-8') as src:
                            content = src.read()
                            f.write(f"\n{'='*80}\n")
                            f.write(f"FILE: {rel_path}\n")
                            f.write(f"{'='*80}\n\n")
                            f.write(content)
                            f.write("\n")
                    except Exception as e:
                        print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    output_path = os.path.join(project_root, 'project_source_code.txt')
    collect_source_code(project_root, output_path)
    print(f"Source code collected into: {output_path}")
