"""
Codebase Explorer API Routes
Provides endpoints for Q&A and regex search on the codebase.
"""
from fastapi import APIRouter, Query
from fastapi.responses import HTMLResponse
from app.services.codebase import CodebaseSearchService, CodebaseQAService
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/codebase", tags=["codebase"])

# Initialize services
search_service = CodebaseSearchService()
qa_service = CodebaseQAService()


class SearchRequest(BaseModel):
    pattern: str
    case_sensitive: bool = False
    file_filter: Optional[str] = None
    max_results: int = 100
    context_lines: int = 2


@router.get("/", response_class=HTMLResponse)
async def codebase_explorer_gui():
    """
    Serves the Codebase Explorer GUI - a beautiful interface for
    Q&A and regex-supported search on the codebase.
    """
    html_content = """
<!DOCTYPE html>
<html lang="sq">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codebase Explorer - Spotify Clone</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-primary: #0a0a0f;
            --bg-secondary: #12121a;
            --bg-tertiary: #1a1a25;
            --bg-card: #16161f;
            --accent-primary: #6366f1;
            --accent-secondary: #8b5cf6;
            --accent-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --text-muted: #64748b;
            --border-color: #2e2e3a;
            --success: #22c55e;
            --warning: #f59e0b;
            --error: #ef4444;
            --code-bg: #1e1e2e;
            --match-highlight: rgba(99, 102, 241, 0.3);
            --match-line: rgba(139, 92, 246, 0.15);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* Background Animation */
        .bg-gradient {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.05) 0%, transparent 70%);
            pointer-events: none;
            z-index: 0;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
            position: relative;
            z-index: 1;
        }

        /* Header */
        header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem 0;
        }

        .logo {
            display: inline-flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .logo-icon {
            width: 60px;
            height: 60px;
            background: var(--accent-gradient);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
        }

        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            background: var(--accent-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .subtitle {
            color: var(--text-secondary);
            font-size: 1.1rem;
            margin-top: 0.5rem;
        }

        /* Tabs */
        .tabs {
            display: flex;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 2rem;
            background: var(--bg-secondary);
            padding: 0.5rem;
            border-radius: 16px;
            width: fit-content;
            margin-left: auto;
            margin-right: auto;
        }

        .tab {
            padding: 0.875rem 2rem;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            font-size: 0.95rem;
            font-weight: 500;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .tab:hover {
            color: var(--text-primary);
            background: var(--bg-tertiary);
        }

        .tab.active {
            background: var(--accent-gradient);
            color: white;
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
        }

        .tab-icon {
            font-size: 1.2rem;
        }

        /* Content Panels */
        .panel {
            display: none;
            animation: fadeIn 0.3s ease;
        }

        .panel.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Search Box */
        .search-container {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
        }

        .search-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
        }

        .search-header h2 {
            font-size: 1.25rem;
            font-weight: 600;
        }

        .search-form {
            display: grid;
            gap: 1.25rem;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .input-group label {
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-secondary);
        }

        .input-wrapper {
            position: relative;
        }

        .input-wrapper input {
            width: 100%;
            padding: 1rem 1.25rem;
            padding-left: 3rem;
            background: var(--bg-tertiary);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            color: var(--text-primary);
            font-size: 1rem;
            font-family: 'JetBrains Mono', monospace;
            transition: all 0.3s ease;
        }

        .input-wrapper input:focus {
            outline: none;
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
        }

        .input-wrapper input::placeholder {
            color: var(--text-muted);
        }

        .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            font-size: 1.25rem;
            color: var(--text-muted);
        }

        .options-row {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            align-items: center;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
            width: 20px;
            height: 20px;
            accent-color: var(--accent-primary);
            cursor: pointer;
        }

        .checkbox-group label {
            color: var(--text-secondary);
            font-size: 0.9rem;
            cursor: pointer;
        }

        .btn {
            padding: 1rem 2rem;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        }

        .btn-primary {
            background: var(--accent-gradient);
            color: white;
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(99, 102, 241, 0.5);
        }

        .btn-secondary {
            background: var(--bg-tertiary);
            color: var(--text-secondary);
            border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
            background: var(--bg-secondary);
            color: var(--text-primary);
        }

        /* Results */
        .results-container {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            overflow: hidden;
        }

        .results-header {
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .results-info {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .results-count {
            font-size: 1.1rem;
            font-weight: 600;
        }

        .results-meta {
            color: var(--text-muted);
            font-size: 0.875rem;
        }

        .badge {
            padding: 0.375rem 0.875rem;
            border-radius: 999px;
            font-size: 0.8rem;
            font-weight: 500;
        }

        .badge-success {
            background: rgba(34, 197, 94, 0.15);
            color: var(--success);
        }

        .badge-warning {
            background: rgba(245, 158, 11, 0.15);
            color: var(--warning);
        }

        /* File Results */
        .file-result {
            border-bottom: 1px solid var(--border-color);
        }

        .file-result:last-child {
            border-bottom: none;
        }

        .file-header {
            padding: 1rem 2rem;
            background: var(--bg-tertiary);
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            transition: background 0.2s ease;
        }

        .file-header:hover {
            background: var(--bg-secondary);
        }

        .file-icon {
            font-size: 1.25rem;
        }

        .file-path {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
            color: var(--accent-primary);
        }

        .match-count {
            margin-left: auto;
            background: var(--accent-primary);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 999px;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .file-matches {
            display: none;
            padding: 0;
        }

        .file-result.expanded .file-matches {
            display: block;
        }

        .file-result.expanded .expand-icon {
            transform: rotate(180deg);
        }

        .expand-icon {
            transition: transform 0.3s ease;
            color: var(--text-muted);
        }

        /* Code Block */
        .code-block {
            background: var(--code-bg);
            border-left: 3px solid var(--border-color);
            margin: 0;
            overflow-x: auto;
        }

        .code-line {
            display: flex;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
            line-height: 1.7;
        }

        .code-line.match {
            background: var(--match-line);
            border-left: 3px solid var(--accent-primary);
            margin-left: -3px;
        }

        .line-number {
            min-width: 60px;
            padding: 0 1rem;
            color: var(--text-muted);
            text-align: right;
            user-select: none;
            border-right: 1px solid var(--border-color);
            background: rgba(0, 0, 0, 0.2);
        }

        .line-content {
            padding: 0 1rem;
            flex: 1;
            white-space: pre;
        }

        .highlight {
            background: var(--match-highlight);
            border-radius: 3px;
            padding: 0 2px;
        }

        /* Q&A Section */
        .qa-grid {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 2rem;
        }

        @media (max-width: 900px) {
            .qa-grid {
                grid-template-columns: 1fr;
            }
        }

        .qa-sidebar {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 1.5rem;
            height: fit-content;
            position: sticky;
            top: 2rem;
        }

        .qa-sidebar h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border-color);
        }

        .category-list {
            list-style: none;
        }

        .category-item {
            padding: 0.875rem 1rem;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-bottom: 0.25rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .category-item:hover {
            background: var(--bg-tertiary);
        }

        .category-item.active {
            background: var(--accent-gradient);
            color: white;
        }

        .category-icon {
            font-size: 1.1rem;
        }

        .qa-main {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 2rem;
        }

        .qa-search {
            margin-bottom: 2rem;
        }

        .qa-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .qa-item {
            background: var(--bg-tertiary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .qa-item:hover {
            border-color: var(--accent-primary);
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1);
        }

        .qa-question {
            padding: 1.25rem 1.5rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 1rem;
            font-weight: 500;
        }

        .qa-question:hover {
            background: var(--bg-secondary);
        }

        .qa-icon {
            width: 32px;
            height: 32px;
            background: var(--accent-gradient);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            flex-shrink: 0;
        }

        .qa-answer {
            display: none;
            padding: 1.25rem 1.5rem;
            padding-top: 0;
            color: var(--text-secondary);
            line-height: 1.7;
            border-top: 1px solid var(--border-color);
            margin-left: 48px;
            margin-right: 1rem;
            padding-left: 0;
        }

        .qa-item.expanded .qa-answer {
            display: block;
            padding-top: 1.25rem;
        }

        .qa-item.expanded .qa-toggle {
            transform: rotate(180deg);
        }

        .qa-toggle {
            margin-left: auto;
            transition: transform 0.3s ease;
            color: var(--text-muted);
        }

        .service-tag {
            font-size: 0.75rem;
            background: rgba(139, 92, 246, 0.15);
            color: var(--accent-secondary);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            margin-left: 0.5rem;
        }

        /* Overview Section */
        .overview-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
        }

        .overview-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 1.75rem;
            transition: all 0.3s ease;
        }

        .overview-card:hover {
            border-color: var(--accent-primary);
            transform: translateY(-2px);
            box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
        }

        .overview-card h3 {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .overview-card h3 span {
            font-size: 1.5rem;
        }

        .tech-list {
            list-style: none;
        }

        .tech-item {
            display: flex;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border-color);
        }

        .tech-item:last-child {
            border-bottom: none;
        }

        .tech-name {
            color: var(--text-secondary);
        }

        .tech-value {
            color: var(--accent-primary);
            font-weight: 500;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.9rem;
        }

        /* Loading State */
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem;
            color: var(--text-secondary);
        }

        .spinner {
            width: 24px;
            height: 24px;
            border: 3px solid var(--border-color);
            border-top-color: var(--accent-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 1rem;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            color: var(--text-muted);
        }

        .empty-state-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.5;
        }

        .empty-state h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }

            h1 {
                font-size: 1.75rem;
            }

            .tabs {
                width: 100%;
            }

            .tab {
                padding: 0.75rem 1rem;
                flex: 1;
                justify-content: center;
            }

            .tab span:not(.tab-icon) {
                display: none;
            }

            .search-container, .results-container, .qa-main, .qa-sidebar {
                padding: 1.25rem;
                border-radius: 16px;
            }

            .options-row {
                flex-direction: column;
                align-items: flex-start;
            }
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }

        ::-webkit-scrollbar-track {
            background: var(--bg-secondary);
        }

        ::-webkit-scrollbar-thumb {
            background: var(--border-color);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: var(--text-muted);
        }
    </style>
</head>
<body>
    <div class="bg-gradient"></div>
    
    <div class="container">
        <header>
            <div class="logo">
                <div class="logo-icon">🔍</div>
                <div>
                    <h1>Codebase Explorer</h1>
                    <p class="subtitle">Kërko dhe eksploro kodin burimor të Spotify Clone</p>
                </div>
            </div>
        </header>

        <div class="tabs">
            <button class="tab active" data-panel="search">
                <span class="tab-icon">🔎</span>
                <span>Kërkim Regex</span>
            </button>
            <button class="tab" data-panel="qa">
                <span class="tab-icon">❓</span>
                <span>Pyetje & Përgjigje</span>
            </button>
            <button class="tab" data-panel="overview">
                <span class="tab-icon">📊</span>
                <span>Përmbledhje</span>
            </button>
        </div>

        <!-- Search Panel -->
        <div class="panel active" id="search-panel">
            <div class="search-container">
                <div class="search-header">
                    <span style="font-size: 1.5rem;">🔍</span>
                    <h2>Kërkim me Regex në Codebase</h2>
                </div>
                <form class="search-form" id="search-form">
                    <div class="input-group">
                        <label>Pattern Regex</label>
                        <div class="input-wrapper">
                            <span class="input-icon">⌨️</span>
                            <input type="text" id="search-pattern" placeholder="p.sh. update_password, def \\w+\\(, class.*Service" required>
                        </div>
                    </div>
                    <div class="input-group">
                        <label>Filter sipas skedarëve (opsional)</label>
                        <div class="input-wrapper">
                            <span class="input-icon">📁</span>
                            <input type="text" id="file-filter" placeholder="p.sh. \\.py$, routes, service">
                        </div>
                    </div>
                    <div class="options-row">
                        <div class="checkbox-group">
                            <input type="checkbox" id="case-sensitive">
                            <label for="case-sensitive">Case Sensitive</label>
                        </div>
                        <div class="checkbox-group">
                            <input type="number" id="context-lines" value="2" min="0" max="10" style="width: 60px; padding: 0.5rem; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);">
                            <label>Rreshta konteksti</label>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <span>🚀</span> Kërko
                        </button>
                    </div>
                </form>
            </div>

            <div id="search-results"></div>
        </div>

        <!-- Q&A Panel -->
        <div class="panel" id="qa-panel">
            <div class="qa-grid">
                <div class="qa-sidebar">
                    <h3>📚 Kategoritë</h3>
                    <ul class="category-list" id="category-list">
                        <li class="category-item active" data-category="all">
                            <span class="category-icon">📋</span>
                            <span>Të gjitha</span>
                        </li>
                        <li class="category-item" data-category="backend">
                            <span class="category-icon">⚙️</span>
                            <span>Backend</span>
                        </li>
                        <li class="category-item" data-category="api">
                            <span class="category-icon">🔌</span>
                            <span>API</span>
                        </li>
                        <li class="category-item" data-category="database">
                            <span class="category-icon">🗄️</span>
                            <span>Database</span>
                        </li>
                        <li class="category-item" data-category="te_pergjithshme">
                            <span class="category-icon">💡</span>
                            <span>Të Përgjithshme</span>
                        </li>
                    </ul>
                </div>
                <div class="qa-main">
                    <div class="qa-search">
                        <div class="input-wrapper">
                            <span class="input-icon">🔍</span>
                            <input type="text" id="qa-search" placeholder="Kërko në pyetje dhe përgjigje...">
                        </div>
                    </div>
                    <div id="qa-list" class="qa-list"></div>
                </div>
            </div>
        </div>

        <!-- Overview Panel -->
        <div class="panel" id="overview-panel">
            <div id="overview-content" class="overview-grid"></div>
        </div>
    </div>

    <script>
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
                
                tab.classList.add('active');
                const panelId = tab.dataset.panel + '-panel';
                document.getElementById(panelId).classList.add('active');
                
                // Load data for the panel
                if (tab.dataset.panel === 'qa') loadQA();
                if (tab.dataset.panel === 'overview') loadOverview();
            });
        });

        // Search form
        document.getElementById('search-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const pattern = document.getElementById('search-pattern').value;
            const fileFilter = document.getElementById('file-filter').value;
            const caseSensitive = document.getElementById('case-sensitive').checked;
            const contextLines = parseInt(document.getElementById('context-lines').value) || 2;
            
            const resultsContainer = document.getElementById('search-results');
            resultsContainer.innerHTML = '<div class="loading"><div class="spinner"></div>Duke kërkuar...</div>';
            
            try {
                const params = new URLSearchParams({
                    pattern: pattern,
                    case_sensitive: caseSensitive,
                    context_lines: contextLines
                });
                if (fileFilter) params.append('file_filter', fileFilter);
                
                const response = await fetch(`/api/v1/codebase/search?${params}`);
                const data = await response.json();
                
                renderSearchResults(data, pattern);
            } catch (error) {
                resultsContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">⚠️</div>
                        <h3>Gabim gjatë kërkimit</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        });

        function renderSearchResults(data, pattern) {
            const container = document.getElementById('search-results');
            
            if (data.error) {
                container.innerHTML = `
                    <div class="results-container">
                        <div class="empty-state">
                            <div class="empty-state-icon">⚠️</div>
                            <h3>Gabim në regex</h3>
                            <p>${data.error}</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            if (data.total_matches === 0) {
                container.innerHTML = `
                    <div class="results-container">
                        <div class="empty-state">
                            <div class="empty-state-icon">🔍</div>
                            <h3>Nuk u gjetën rezultate</h3>
                            <p>Provo me një pattern tjetër ose hiq filtrat.</p>
                        </div>
                    </div>
                `;
                return;
            }
            
            let html = `
                <div class="results-container">
                    <div class="results-header">
                        <div class="results-info">
                            <span class="results-count">${data.total_matches} përputhje</span>
                            <span class="results-meta">në ${data.files_matched} skedarë</span>
                        </div>
                        <span class="badge badge-success">${data.files_searched} skedarë u skanuan</span>
                    </div>
            `;
            
            for (const file of data.matches) {
                const fileExt = file.file.split('.').pop();
                const fileIcon = getFileIcon(fileExt);
                
                html += `
                    <div class="file-result">
                        <div class="file-header" onclick="this.parentElement.classList.toggle('expanded')">
                            <span class="file-icon">${fileIcon}</span>
                            <span class="file-path">${file.file}</span>
                            <span class="match-count">${file.matches.length}</span>
                            <span class="expand-icon">▼</span>
                        </div>
                        <div class="file-matches">
                            <div class="code-block">
                `;
                
                for (const match of file.matches) {
                    for (const ctx of match.context) {
                        const highlightedContent = ctx.is_match 
                            ? highlightMatches(escapeHtml(ctx.content), pattern, data.case_sensitive)
                            : escapeHtml(ctx.content);
                        
                        html += `
                            <div class="code-line ${ctx.is_match ? 'match' : ''}">
                                <span class="line-number">${ctx.line_number}</span>
                                <span class="line-content">${highlightedContent}</span>
                            </div>
                        `;
                    }
                    // Add separator between matches
                    html += '<div style="height: 8px; background: var(--bg-secondary);"></div>';
                }
                
                html += `
                            </div>
                        </div>
                    </div>
                `;
            }
            
            html += '</div>';
            container.innerHTML = html;
        }

        function getFileIcon(ext) {
            const icons = {
                'py': '🐍',
                'js': '📜',
                'jsx': '⚛️',
                'ts': '📘',
                'tsx': '⚛️',
                'html': '🌐',
                'css': '🎨',
                'scss': '🎨',
                'json': '📋',
                'md': '📝',
                'sql': '🗃️',
                'yml': '⚙️',
                'yaml': '⚙️',
                'txt': '📄'
            };
            return icons[ext] || '📄';
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function highlightMatches(text, pattern, caseSensitive) {
            try {
                const flags = caseSensitive ? 'g' : 'gi';
                const regex = new RegExp(`(${pattern})`, flags);
                return text.replace(regex, '<span class="highlight">$1</span>');
            } catch {
                return text;
            }
        }

        // Q&A functionality
        let qaData = null;
        let currentCategory = 'all';

        async function loadQA() {
            if (qaData) {
                renderQA();
                return;
            }
            
            const qaList = document.getElementById('qa-list');
            qaList.innerHTML = '<div class="loading"><div class="spinner"></div>Duke ngarkuar...</div>';
            
            try {
                const response = await fetch('/api/v1/codebase/qa');
                qaData = await response.json();
                renderQA();
            } catch (error) {
                qaList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">⚠️</div>
                        <h3>Gabim gjatë ngarkimit</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }

        function renderQA(searchQuery = '') {
            const qaList = document.getElementById('qa-list');
            let allItems = [];
            
            for (const [key, category] of Object.entries(qaData.kategorite)) {
                if (currentCategory !== 'all' && currentCategory !== key) continue;
                
                for (const qa of category.pyetje) {
                    if (searchQuery) {
                        const query = searchQuery.toLowerCase();
                        if (!qa.pyetje.toLowerCase().includes(query) && 
                            !qa.pergjigje.toLowerCase().includes(query)) {
                            continue;
                        }
                    }
                    allItems.push({ ...qa, category: key, categoryName: category.emri });
                }
            }
            
            if (allItems.length === 0) {
                qaList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">❓</div>
                        <h3>Nuk u gjetën pyetje</h3>
                        <p>Provo me një kërkim tjetër.</p>
                    </div>
                `;
                return;
            }
            
            let html = '';
            for (const item of allItems) {
                const serviceTag = item.sherbimi 
                    ? `<span class="service-tag">${item.sherbimi}</span>` 
                    : '';
                
                html += `
                    <div class="qa-item" onclick="this.classList.toggle('expanded')">
                        <div class="qa-question">
                            <span class="qa-icon">Q</span>
                            <span>${item.pyetje}${serviceTag}</span>
                            <span class="qa-toggle">▼</span>
                        </div>
                        <div class="qa-answer">
                            ${item.pergjigje}
                        </div>
                    </div>
                `;
            }
            
            qaList.innerHTML = html;
        }

        // Category selection
        document.getElementById('category-list').addEventListener('click', (e) => {
            const item = e.target.closest('.category-item');
            if (!item) return;
            
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            currentCategory = item.dataset.category;
            renderQA(document.getElementById('qa-search').value);
        });

        // Q&A search
        document.getElementById('qa-search').addEventListener('input', (e) => {
            renderQA(e.target.value);
        });

        // Overview
        async function loadOverview() {
            const container = document.getElementById('overview-content');
            container.innerHTML = '<div class="loading"><div class="spinner"></div>Duke ngarkuar...</div>';
            
            try {
                const response = await fetch('/api/v1/codebase/overview');
                const data = await response.json();
                
                let html = `
                    <div class="overview-card">
                        <h3><span>🚀</span> Projekti</h3>
                        <ul class="tech-list">
                            <li class="tech-item">
                                <span class="tech-name">Emri</span>
                                <span class="tech-value">${data.projekt}</span>
                            </li>
                        </ul>
                    </div>
                `;
                
                for (const [category, techs] of Object.entries(data.teknologjite)) {
                    const icon = {
                        'frontend': '🖥️',
                        'backend': '⚙️',
                        'database': '🗄️',
                        'deployment': '🚢'
                    }[category] || '📦';
                    
                    html += `
                        <div class="overview-card">
                            <h3><span>${icon}</span> ${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                            <ul class="tech-list">
                    `;
                    
                    for (const [key, value] of Object.entries(techs)) {
                        html += `
                            <li class="tech-item">
                                <span class="tech-name">${key.replace(/_/g, ' ')}</span>
                                <span class="tech-value">${value}</span>
                            </li>
                        `;
                    }
                    
                    html += '</ul></div>';
                }
                
                // Services
                html += `
                    <div class="overview-card" style="grid-column: span 2;">
                        <h3><span>🔧</span> Shërbimet Kryesore</h3>
                        <ul class="tech-list">
                `;
                
                for (const service of data.sherbimet_kryesore) {
                    html += `
                        <li class="tech-item">
                            <span class="tech-name">${service.emri}</span>
                            <span class="tech-value" style="color: var(--text-secondary); font-family: inherit;">${service.pershkrimi}</span>
                        </li>
                    `;
                }
                
                html += '</ul></div>';
                
                container.innerHTML = html;
            } catch (error) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">⚠️</div>
                        <h3>Gabim gjatë ngarkimit</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
    </script>
</body>
</html>
    """
    return HTMLResponse(content=html_content)


@router.get("/search")
async def search_codebase(
    pattern: str = Query(..., description="Regex pattern to search for"),
    case_sensitive: bool = Query(False, description="Case-sensitive search"),
    file_filter: str = Query(None, description="Regex to filter file paths"),
    max_results: int = Query(100, description="Maximum results to return"),
    context_lines: int = Query(2, description="Context lines around matches")
):
    """
    Search the codebase using regex patterns.
    
    Examples:
    - Search for function: `update_password`
    - Search for class definitions: `class.*Service`
    - Search for imports: `from fastapi import`
    - Filter Python files only: `file_filter=\\.py$`
    """
    return search_service.search(
        pattern=pattern,
        case_sensitive=case_sensitive,
        file_filter=file_filter,
        max_results=max_results,
        context_lines=context_lines
    )


@router.get("/qa")
async def get_all_qa():
    """
    Get all Q&A organized by category.
    """
    return qa_service.get_all_qa()


@router.get("/qa/search")
async def search_qa(q: str = Query(..., description="Search query")):
    """
    Search Q&A by query string.
    """
    return qa_service.search_qa(q)


@router.get("/overview")
async def get_codebase_overview():
    """
    Get an overview of the codebase structure and technologies.
    """
    return qa_service.get_codebase_overview()


@router.get("/service/{service_name}")
async def get_service_info(service_name: str):
    """
    Get detailed information about a specific service.
    """
    return qa_service.get_service_info(service_name)


@router.get("/file")
async def get_file_content(path: str = Query(..., description="Relative file path")):
    """
    Get the content of a specific file.
    """
    return search_service.get_file_content(path)


@router.get("/structure")
async def get_project_structure(max_depth: int = Query(4, description="Maximum depth")):
    """
    Get the project directory structure.
    """
    return search_service.get_project_structure(max_depth)
